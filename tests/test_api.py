import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"HydroSentinel" in response.data
    assert b"Team Quantum Mind" in response.data or b"Team Quantum Minds" in response.data

def test_dashboard_page(client):
    response = client.get('/dashboard')
    assert response.status_code == 200
    assert b"HydroSentinel AI" in response.data
    assert b"Team Quantum Mind" in response.data or b"Team Quantum Minds" in response.data
    assert b"Phone & Email Alert Sender" in response.data

def test_analytics_page(client):
    response = client.get('/analytics')
    assert response.status_code == 200
    assert b"Geospatial Analytics" in response.data

def test_early_warning_page(client):
    response = client.get('/early-warning')
    assert response.status_code == 200
    assert b"Civil Defense" in response.data

def test_models_hub_page(client):
    response = client.get('/models')
    assert response.status_code == 200
    assert b"AI Model Hub" in response.data

def test_about_page(client):
    response = client.get('/about')
    assert response.status_code == 200
    assert b"Team Quantum Mind" in response.data or b"Team Quantum Minds" in response.data

def test_simulator_page(client):
    response = client.get('/predict')
    assert response.status_code == 200
    assert b"Scenario Simulation" in response.data

def test_api_live_telemetry(client):
    response = client.get('/api/live-telemetry')
    assert response.status_code == 200
    json_data = response.get_json()
    assert "telemetry" in json_data
    assert "prediction" in json_data

def test_api_send_alerts(client):
    payload = {
        "station": "STN-AL-02",
        "phone_numbers": ["+91 98765 43210", "+91 91234 56789"],
        "emails": ["emergency.command@gov.in", "rescue.team@ndma.gov.in"],
        "severity": "CRITICAL EVACUATION",
        "message": "Immediate flood evacuation alert."
    }
    response = client.post('/api/send-alerts', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert json_data["total_dispatched"] == 4
    assert len(json_data["receipts"]) == 4

def test_api_cap_export(client):
    response = client.get('/api/export-cap-alert?station=STN-AL-02')
    assert response.status_code == 200
    assert b"urn:oasis:names:tc:emergency:cap:1.2" in response.data


def test_api_csv_export(client):
    response = client.get('/api/export-csv?station=STN-KL-01')
    assert response.status_code == 200
    assert response.content_type.startswith('text/csv')
    assert b'timestamp_utc' in response.data
    assert b'STN-KL-01' in response.data


def test_api_stations(client):
    response = client.get('/api/stations')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert json_data["total_stations"] == 8
    assert any(s["id"] == "STN-KD-05" for s in json_data["stations"])

def test_api_timeseries(client):
    response = client.get('/api/timeseries?station=STN-KD-05')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert len(json_data["timeline_hours"]) == 24

def test_api_basin_risk_matrix(client):
    response = client.get('/api/basin-risk-matrix')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert len(json_data["ranked_stations"]) == 8

def test_api_weather_radar(client):
    response = client.get('/api/weather-radar')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert "reflectivity_dBZ" in json_data

def test_api_explorer_page(client):
    response = client.get('/api-explorer')
    assert response.status_code == 200
    assert b"Developer API Hub" in response.data


def test_api_ingestion_status(client):
    response = client.get('/api/ingestion-status')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert json_data["active_pipelines_count"] >= 9
    assert "NASA_GPM" in json_data["sources"]
    assert "LORAWAN_IOT_MESH" in json_data["sources"]
    assert "IMD_SEISMIC_ACOUSTIC" in json_data["sources"]
    assert "DRONE_LIDAR_BATHYMETRY" in json_data["sources"]

def test_api_ingest_custom(client):
    payload = {
        "station_id": "STN-TEST-99",
        "rainfall_intensity_mm_hr": 78.5,
        "soil_moisture_percentage": 88.0,
        "river_water_level_m": 5.2
    }
    response = client.post('/api/ingest/custom', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert "STN-TEST-99" in json_data["message"]


def test_api_export_geojson(client):
    response = client.get('/api/export-geojson')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["type"] == "FeatureCollection"
    assert len(json_data["features"]) == 8
    assert json_data["features"][0]["geometry"]["type"] == "Point"


def test_api_dispatch_broadcast(client):
    payload = {
        "station_id": "STN-KD-05",
        "threat_level": "CRITICAL EVACUATION",
        "channels": ["SMS", "Telegram", "CAP"]
    }
    response = client.post('/api/dispatch-broadcast', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert json_data["station_id"] == "STN-KD-05"
    assert "recipients_targeted" in json_data


def test_api_submit_feedback(client):
    payload = {
        "name": "Dr. Sarah Jenkins",
        "email": "sarah.jenkins@hydrology.org",
        "rating": 5,
        "category": "3D UI/UX Design",
        "comments": "The 3D Topographic Digital Twin and Bayesian Hydrograph are world-class!"
    }
    response = client.post('/api/submit-feedback', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert "feedback_id" in json_data


def test_api_get_feedbacks(client):
    response = client.get('/api/feedbacks')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert "submissions" in json_data


def test_feedback_page(client):
    response = client.get('/feedback')
    assert response.status_code == 200
    assert b"Community Reviews" in response.data
    assert b"99.4%" in response.data


def test_api_copilot_chat(client):
    payload = {"query": "What is the flood threat in Kedarnath right now?"}
    response = client.post('/api/copilot/chat', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert "Kedarnath" in json_data["reply"]

def test_api_anomalies(client):
    response = client.get('/api/anomalies')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert len(json_data["anomalies"]) >= 2


def test_api_explorer_visitor_restricted(client):
    response = client.get('/api-explorer')
    assert response.status_code == 200
    assert b"Restricted Admin Zone" in response.data

def test_api_admin_auth_success(client):
    response = client.post('/api/admin-auth', json={"passkey": "quantum2026"})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"


def test_api_stress_test(client):
    payload = {"multiplier": 2.5}
    response = client.post('/api/stress-test', json=payload)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert "stations_stressed" in json_data
    assert json_data["active_siren_relays"] == 8

def test_api_inundation_contour(client):
    response = client.get('/api/inundation-contour?station=STN-KD-05')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert len(json_data["contour_horizons"]) == 4

def test_api_health_matrix(client):
    response = client.get('/api/health-matrix')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "HEALTHY"
    assert json_data["p95_inference_latency_ms"] <= 20.0


def test_api_ingest_batch_multi_source(client):
    response = client.post('/api/ingest/batch-multi-source')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert json_data["modes_synchronized"] >= 9


def test_time_machine_page(client):
    response = client.get('/time-machine')
    assert response.status_code == 200
    assert b"Historical Disaster Time-Machine" in response.data

def test_api_time_machine_events(client):
    response = client.get('/api/time-machine/events')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert len(json_data["events"]) >= 3


def test_satellites_page(client):
    response = client.get('/satellites')
    assert response.status_code == 200
    assert b"Earth Observation Satellite Constellation Tracker" in response.data

def test_api_satellites(client):
    response = client.get('/api/satellites')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert json_data["total_satellites_tracked"] >= 4

def test_api_export_intelligence_briefing(client):
    response = client.get('/api/export-intelligence-briefing')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "SUCCESS"
    assert "highest_threat_station" in json_data


def test_api_tactical_playbook(client):
    response = client.get('/api/tactical-playbook?basin_id=kedarnath&severity=CRITICAL')
    assert response.status_code == 200
    data = response.get_json()
    assert 'playbook_id' in data
    assert data['threat_level'] == 'CRITICAL'
    assert 'immediate_actions' in data
    assert len(data['immediate_actions']) > 0
    assert data['status'] == 'success'


def test_uav_feed_page(client):
    response = client.get('/uav-feed')
    assert response.status_code == 200
    assert b'LIVE UAV THERMAL FEED' in response.data


def test_damage_assessment_module(client):
    res = client.get('/damage-assessment')
    assert res.status_code == 200
    assert b'Satellite SAR Inundation Damage Assessment' in res.data

def test_api_damage_calculate(client):
    res = client.post('/api/damage-assessment/calculate', json={
        'station': 'STN-KD-05',
        'stage_surge_m': 5.4
    })
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'success'
    assert 'damage_index_pct' in json_data
    assert json_data['roads_submerged_km'] > 0


def test_intelligence_briefing_page(client):
    res = client.get('/intelligence-briefing')
    assert res.status_code == 200
    assert b'NATIONAL DISASTER MANAGEMENT AUTHORITY' in res.data
    assert b'EXECUTIVE SITUATION REPORT' in res.data


def test_citizen_incident_portal(client):
    res = client.get('/report-incident')
    assert res.status_code == 200
    assert b'Crowdsourced Citizen Flood SOS' in res.data

def test_api_citizen_reports_crud(client):
    # GET
    res_get = client.get('/api/citizen-reports')
    assert res_get.status_code == 200
    assert res_get.get_json()['status'] == 'success'
    
    # POST
    res_post = client.post('/api/citizen-reports', json={
        'reporter_name': 'Test Citizen',
        'station_id': 'STN-KD-05',
        'latitude': 30.7346,
        'longitude': 79.0669,
        'flood_depth': 'Chest Deep (1.8m)',
        'trapped_persons': 3,
        'description': 'Bridge breach test'
    })
    assert res_post.status_code == 201
    json_data = res_post.get_json()
    assert json_data['status'] == 'success'
    assert 'incident_id' in json_data

def test_api_citizen_sos_beacon(client):
    res = client.post('/api/citizen-reports/sos', json={
        'latitude': 30.7320,
        'longitude': 79.0660
    })
    assert res.status_code == 200
    assert res.get_json()['status'] == 'SOS_BROADCAST_ACTIVE'


def test_components_hub_page(client):
    res = client.get('/components-hub')
    assert res.status_code == 200
    assert b'21ST.DEV DESIGN ENGINEER REGISTRY' in res.data
    assert b'Incident Escalation Funnel Chart' in res.data


def test_api_send_alert_email(client):
    res = client.post('/api/send-alert-email', json={
        'recipient_email': 'test.responder@ndrf.gov.in',
        'station_name': 'Kedarnath Mandakini Gorge',
        'threat_level': 'CRITICAL RED',
        'notes': 'Test alert dispatch'
    })
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'success'
    assert 'email_id' in json_data
    assert json_data['recipient'] == 'test.responder@ndrf.gov.in'


def test_api_dispatch_broadcast_channels(client):
    res = client.post('/api/broadcast/dispatch-channels', json={
        'station_id': 'STN-KD-05',
        'station_name': 'Kedarnath Mandakini Gorge',
        'threat_level': 'CRITICAL RED',
        'notes': 'Test broadcast'
    })
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data['status'] == 'success'
    assert 'broadcast_id' in json_data
    assert json_data['total_civilian_reach'] == 25700
