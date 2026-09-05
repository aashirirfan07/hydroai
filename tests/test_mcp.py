import sys
import os
import json
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app
from src.mcp_service import mcp_service


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ==============================================================================
# 1. MCP SERVICE CORE & TOOL CATALOG TESTS
# ==============================================================================

def test_mcp_list_tools():
    tools = mcp_service.list_tools()
    assert len(tools) == 10
    names = [t['name'] for t in tools]
    assert "hydrosentinel_get_stations" in names
    assert "hydrosentinel_get_telemetry" in names
    assert "hydrosentinel_predict_flood_risk" in names
    assert "hydrosentinel_compute_evacuation_route" in names
    assert "hydrosentinel_query_world_geohazards" in names
    assert "hydrosentinel_generate_cap_alert" in names
    assert "hydrosentinel_simulate_dam_breach" in names
    assert "hydrosentinel_get_satellite_swaths" in names
    assert "hydrosentinel_get_multi_source_telemetry" in names
    assert "hydrosentinel_plan_drone_mission" in names


def test_mcp_tool_get_stations():
    res = mcp_service.call_tool("hydrosentinel_get_stations", {"region": "All"})
    assert res["isError"] is False
    data = res["_raw"]
    assert data["total_stations"] >= 8
    assert "STN-KD-05" in data["stations"]


def test_mcp_tool_get_telemetry():
    res = mcp_service.call_tool("hydrosentinel_get_telemetry", {"station_id": "STN-KD-05"})
    assert res["isError"] is False
    data = res["_raw"]
    assert data["station_id"] == "STN-KD-05"
    assert "precipitation_rate_mm_hr" in data["telemetry"]
    assert "water_stage_level_m" in data["telemetry"]


def test_mcp_tool_predict_flood_risk():
    res = mcp_service.call_tool("hydrosentinel_predict_flood_risk", {
        "station_id": "STN-KD-05",
        "rainfall_intensity_mm_hr": 95.0,
        "river_water_level_m": 5.8
    })
    assert res["isError"] is False
    data = res["_raw"]
    assert 0 <= data["risk_score"] <= 1200
    assert 0.0 <= data["flood_probability_pct"] <= 100.0
    assert "CRITICAL" in data["alert_level"] or "HIGH" in data["alert_level"]


def test_mcp_tool_compute_evacuation_route():
    res = mcp_service.call_tool("hydrosentinel_compute_evacuation_route", {
        "station_id": "STN-KD-05",
        "flood_depth_m": 4.0
    })
    assert res["isError"] is False
    data = res["_raw"]
    assert len(data["waypoints"]) >= 3
    assert "Civil Defense Bunker" in data["primary_assembly_point"]


def test_mcp_tool_query_world_geohazards():
    res = mcp_service.call_tool("hydrosentinel_query_world_geohazards", {"hazard_type": "all", "limit": 5})
    assert res["isError"] is False
    data = res["_raw"]
    assert len(data["events"]) > 0


def test_mcp_tool_generate_cap_alert():
    res = mcp_service.call_tool("hydrosentinel_generate_cap_alert", {
        "station_id": "STN-KD-05",
        "severity": "Extreme",
        "urgency": "Immediate"
    })
    assert res["isError"] is False
    data = res["_raw"]
    assert data["status"] == "DISPATCHED"
    assert "cap_document" in data


def test_mcp_tool_simulate_dam_breach():
    res = mcp_service.call_tool("hydrosentinel_simulate_dam_breach", {
        "station_id": "STN-KD-05",
        "surge_height_m": 5.0,
        "release_volume_mcm": 10.0
    })
    assert res["isError"] is False
    data = res["_raw"]
    assert data["wave_front_velocity_mps"] > 0
    assert "1km" in data["arrival_time_at_downstream_km_mins"]


def test_mcp_tool_get_satellite_swaths():
    res = mcp_service.call_tool("hydrosentinel_get_satellite_swaths", {"station_id": "STN-KD-05"})
    assert res["isError"] is False
    data = res["_raw"]
    assert len(data["constellations"]) >= 3


def test_mcp_tool_get_multi_source_telemetry():
    res = mcp_service.call_tool("hydrosentinel_get_multi_source_telemetry", {"source_filter": "ALL"})
    assert res["isError"] is False
    data = res["_raw"]
    assert data["active_pipelines_count"] >= 8
    assert len(data["stations"]) == 6
    assert len(data["satellites"]) == 4


def test_mcp_tool_plan_drone_mission():
    res = mcp_service.call_tool("hydrosentinel_plan_drone_mission", {
        "station_id": "STN-KD-05",
        "pattern_type": "LAWNMOWER",
        "swarm_size": 2,
        "altitude_agl_m": 60.0,
        "payloads": ["MED_KIT_HIGH_ALTITUDE", "INFLATABLE_SURVIVAL_RAFT"]
    })
    assert res["isError"] is False
    data = res["_raw"]
    assert data["status"] == "SUCCESS"
    assert "mission_summary" in data
    assert len(data["drone_tracks"]) == 2
    assert "airdrop_zones" in data


def test_mcp_resources():
    resources = mcp_service.list_resources()
    assert len(resources) >= 4
    uris = [r['uri'] for r in resources]
    assert "hydrosentinel://stations" in uris
    assert "hydrosentinel://telemetry/live" in uris
    assert "hydrosentinel://alerts/active" in uris
    assert "hydrosentinel://telemetry/multi-source" in uris
    assert "hydrosentinel://drones/fleet" in uris

    res_multi = mcp_service.read_resource("hydrosentinel://telemetry/multi-source")
    assert "v4.5-REALTIME-MULTI-SOURCE" in res_multi["contents"]

    # Read drone fleet resource
    res_fleet = mcp_service.read_resource("hydrosentinel://drones/fleet")
    assert "DRONE-ALPHA" in res_fleet["contents"]

    # Read resource
    res = mcp_service.read_resource("hydrosentinel://stations")
    assert "STN-KD-05" in res["contents"]


def test_mcp_prompts():
    prompts = mcp_service.list_prompts()
    assert len(prompts) >= 2
    names = [p['name'] for p in prompts]
    assert "flood_hazard_assessment" in names

    # Get prompt
    p = mcp_service.get_prompt("flood_hazard_assessment", {"station_id": "STN-KD-05"})
    assert len(p["messages"]) >= 2


# ==============================================================================
# 2. FLASK HTTP & JSON-RPC ENDPOINTS TESTS
# ==============================================================================

def test_endpoint_api_mcp_tools(client):
    res = client.get('/api/mcp/tools')
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "SUCCESS"
    assert data["total_tools"] == 10


def test_endpoint_api_mcp_initialize(client):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {}
    }
    res = client.post('/api/mcp', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["result"]["serverInfo"]["name"] == "hydrosentinel-mcp-server"
    assert data["result"]["protocolVersion"] == "2024-11-05"


def test_endpoint_api_mcp_tools_list(client):
    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }
    res = client.post('/api/mcp', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["result"]["tools"]) == 10


def test_endpoint_api_mcp_tools_call(client):
    payload = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "hydrosentinel_predict_flood_risk",
            "arguments": {"station_id": "STN-KD-05"}
        }
    }
    res = client.post('/api/mcp', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["result"]["isError"] is False
    assert len(data["result"]["content"]) > 0


def test_endpoint_api_mcp_config(client):
    res = client.get('/api/mcp/config')
    assert res.status_code == 200
    data = res.get_json()
    assert "claude_desktop" in data
    assert "cursor" in data
    assert "remote_sse" in data


def test_endpoint_mcp_hub_page(client):
    res = client.get('/mcp')
    assert res.status_code == 200
    assert b"Model Context Protocol" in res.data
    assert b"hydrosentinel_predict_flood_risk" in res.data

    res2 = client.get('/mcp-hub')
    assert res2.status_code == 200


def test_copilot_chat_mcp_execution(client):
    res = client.post('/api/copilot/chat', json={"query": "What is the flood threat in Kedarnath?"})
    assert res.status_code == 200
    data = res.get_json()
    assert "tools_invoked" in data
    assert len(data["tools_invoked"]) > 0
    tool_names = [t["tool"] for t in data["tools_invoked"]]
    assert "hydrosentinel_predict_flood_risk" in tool_names or "hydrosentinel_get_telemetry" in tool_names
