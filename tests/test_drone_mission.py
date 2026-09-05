import sys
import os
import json
import xml.etree.ElementTree as ET
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app
from src.drone_mission_service import drone_mission_service, DroneMissionService


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ==============================================================================
# 1. DRONE MISSION SERVICE & FLEET TESTS
# ==============================================================================

def test_drone_fleet_status():
    fleet = drone_mission_service.get_fleet_status()
    assert len(fleet) == 4
    ids = [d["drone_id"] for d in fleet]
    assert "DRONE-ALPHA" in ids
    assert "DRONE-BRAVO" in ids
    assert "DRONE-CHARLIE" in ids
    assert "DRONE-DELTA" in ids
    for d in fleet:
        assert d["battery_percent"] > 50
        assert d["max_flight_time_min"] >= 35
        assert "thermal_flir" in d["sensors"]
        assert "airdrop_winch" in d["sensors"]


def test_drone_plan_lawnmower_pattern():
    mission = drone_mission_service.plan_swarm_mission(
        station_id="STN-KD-05",
        pattern_type="LAWNMOWER",
        swarm_size=2,
        altitude_agl=65.0,
        selected_payloads=["MED_KIT_HIGH_ALTITUDE", "INFLATABLE_SURVIVAL_RAFT"]
    )
    assert mission["status"] == "SUCCESS"
    assert mission["mission_id"].startswith("SAR-")
    assert mission["station"]["id"] == "STN-KD-05"
    assert len(mission["drone_tracks"]) == 2

    # Verify track details
    for track in mission["drone_tracks"]:
        assert len(track["waypoints"]) >= 6
        assert track["flight_duration_min"] > 0
        assert track["battery_consumed_percent"] > 0
        assert track["battery_remaining_percent"] > 0
        # Check waypoint structure
        wp = track["waypoints"][0]
        assert "lat" in wp and "lon" in wp and "alt_agl_m" in wp and "alt_msl_m" in wp
        assert wp["alt_agl_m"] == 65.0

    # Verify summary
    summary = mission["mission_summary"]
    assert summary["pattern"] == "Parallel Lawnmower Grid"
    assert summary["assigned_drones"] == 2
    assert summary["total_coverage_km2"] > 0
    assert len(mission["airdrop_zones"]) >= 1


def test_drone_plan_spiral_pattern():
    mission = drone_mission_service.plan_swarm_mission(
        station_id="STN-KL-01",
        pattern_type="SPIRAL",
        swarm_size=3,
        altitude_agl=50.0,
        selected_payloads=["EMERGENCY_COMMS_BEACON"]
    )
    assert mission["status"] == "SUCCESS"
    assert len(mission["drone_tracks"]) == 3
    assert mission["mission_summary"]["pattern"] == "Expanding Archimedian Spiral"
    for track in mission["drone_tracks"]:
        assert len(track["waypoints"]) >= 10


def test_drone_plan_river_corridor_pattern():
    mission = drone_mission_service.plan_swarm_mission(
        station_id="STN-TS-03",
        pattern_type="RIVER",
        swarm_size=2,
        altitude_agl=70.0,
        selected_payloads=["FOOD_RATION_SURVIVAL_PACK"]
    )
    assert mission["status"] == "SUCCESS"
    assert mission["mission_summary"]["pattern"] == "River Corridor Sweep"
    for track in mission["drone_tracks"]:
        assert len(track["waypoints"]) >= 5


def test_drone_plan_contour_pattern():
    mission = drone_mission_service.plan_swarm_mission(
        station_id="STN-CH-06",
        pattern_type="CONTOUR",
        swarm_size=4,
        altitude_agl=80.0,
        selected_payloads=["MED_KIT_HIGH_ALTITUDE"]
    )
    assert mission["status"] == "SUCCESS"
    assert len(mission["drone_tracks"]) == 4
    assert mission["mission_summary"]["pattern"] == "Mountain Contour Relief"


def test_drone_plan_boundary_conditions():
    # Test swarm sizing clamping
    m1 = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=1)
    assert len(m1["drone_tracks"]) == 1

    m5 = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=10)
    assert len(m5["drone_tracks"]) == 4  # Clamped to max fleet size

    # Test unknown station fallback
    m_unknown = drone_mission_service.plan_swarm_mission(station_id="NON_EXISTENT_STN")
    assert m_unknown["status"] == "SUCCESS"
    assert m_unknown["station"]["id"] == "STN-KD-05"


# ==============================================================================
# 2. FLIGHT TELEMETRY & EXPORTER FORMAT TESTS
# ==============================================================================

def test_export_qgroundcontrol_plan():
    mission = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=2)
    plan_str = drone_mission_service.export_mission_format(mission, "qgc_plan")
    
    # Must be valid JSON
    plan = json.loads(plan_str)
    assert plan["fileType"] == "Plan"
    assert plan["version"] == 1
    assert "HydroSentinel" in plan["groundStation"]
    assert "mission" in plan
    
    # Check mission cruise speed and items
    m = plan["mission"]
    assert m["cruiseSpeed"] == 15.0
    assert m["hoverSpeed"] == 5.0
    assert len(m["items"]) >= 5
    
    first_item = m["items"][0]
    assert first_item["type"] == "SimpleItem"
    assert first_item["command"] in [16, 22]  # NAV_WAYPOINT or NAV_TAKEOFF
    assert "params" in first_item
    assert len(first_item["params"]) == 7


def test_export_mavlink_waypoints():
    mission = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=1)
    mav_str = drone_mission_service.export_mission_format(mission, "mavlink_waypoints")
    
    lines = mav_str.strip().split("\n")
    # Must start with MAVLink standard header
    assert lines[0].strip() == "QGC WPL 110"
    assert len(lines) >= 3
    
    # Check row format: INDEX, CURRENT, COORD_FRAME, COMMAND, P1-P4, LAT, LON, ALT, AUTOCONTINUE
    for line in lines[1:]:
        if not line.strip():
            continue
        cols = line.split("\t")
        assert len(cols) == 12
        index = int(cols[0])
        current = int(cols[1])
        coord_frame = int(cols[2])
        command = int(cols[3])
        lat = float(cols[8])
        lon = float(cols[9])
        alt = float(cols[10])
        autocontinue = int(cols[11])
        assert command in [16, 20, 22]
        assert lat > 0 and lon > 0


def test_export_google_earth_kml():
    mission = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=2)
    kml_str = drone_mission_service.export_mission_format(mission, "kml_3d")
    
    assert kml_str.startswith("<?xml")
    assert "<kml" in kml_str
    assert "</kml>" in kml_str
    
    # Must be valid XML
    root = ET.fromstring(kml_str)
    assert "kml" in root.tag.lower()
    
    # Check for Document and Placemarks
    placemarks = root.findall(".//{http://www.opengis.net/kml/2.2}Placemark")
    assert len(placemarks) >= 2
    
    # Check for LineString flight paths
    linestrings = root.findall(".//{http://www.opengis.net/kml/2.2}LineString")
    assert len(linestrings) >= 2


def test_export_geojson():
    mission = drone_mission_service.plan_swarm_mission(station_id="STN-KD-05", swarm_size=2)
    geojson_str = drone_mission_service.export_mission_format(mission, "geojson")
    
    # Must be valid GeoJSON FeatureCollection
    data = json.loads(geojson_str)
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 3  # Waypoint tracks + airdrop points
    
    geom_types = [f["geometry"]["type"] for f in data["features"]]
    assert "LineString" in geom_types
    assert "Point" in geom_types


# ==============================================================================
# 3. FLASK WEB ROUTES & API ENDPOINT TESTS
# ==============================================================================

def test_drone_mission_planner_page(client):
    res = client.get('/drone-mission-planner')
    assert res.status_code == 200
    assert b"Autonomous Drone Swarm SAR Mission Planner" in res.data
    assert b"QGroundControl" in res.data
    assert b"MAVLink" in res.data
    assert b"Thermal FLIR" in res.data


def test_drone_missions_alias_page(client):
    res = client.get('/drone-missions')
    assert res.status_code == 200
    assert b"Autonomous Drone Swarm SAR Mission Planner" in res.data


def test_api_drone_fleet_status(client):
    res = client.get('/api/drone/fleet-status')
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "SUCCESS"
    assert len(data["fleet"]) == 4


def test_api_drone_generate_mission(client):
    payload = {
        "station_id": "STN-KD-05",
        "pattern_type": "LAWNMOWER",
        "swarm_size": 2,
        "altitude_agl": 60.0,
        "payloads": ["MED_KIT_HIGH_ALTITUDE"]
    }
    res = client.post('/api/drone/generate-mission', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "SUCCESS"
    assert "drone_tracks" in data
    assert len(data["drone_tracks"]) == 2
    assert "mission_summary" in data


def test_api_drone_dispatch_swarm(client):
    payload = {
        "mission_id": "SAR-TEST-001",
        "station_id": "STN-KD-05",
        "assigned_drones": ["DRONE-ALPHA", "DRONE-BRAVO"]
    }
    res = client.post('/api/drone/dispatch-swarm', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "SUCCESS"
    assert "DISPATCHED" in data["dispatch_status"]


def test_api_drone_export_all_formats(client):
    formats = ["qgc_plan", "mavlink_waypoints", "kml_3d", "geojson"]
    for fmt in formats:
        payload = {
            "station_id": "STN-KD-05",
            "pattern_type": "SPIRAL",
            "swarm_size": 2,
            "format": fmt
        }
        res = client.post('/api/drone/export', json=payload)
        assert res.status_code == 200
        assert len(res.data) > 0
        if fmt == "qgc_plan":
            assert b"QGroundControl" in res.data
        elif fmt == "mavlink_waypoints":
            assert b"QGC WPL 110" in res.data
        elif fmt == "kml_3d":
            assert b"<kml" in res.data
        elif fmt == "geojson":
            assert b"FeatureCollection" in res.data
