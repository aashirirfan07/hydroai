# 🚀 HydroSentinel AI™ — Production Deployment Guide

HydroSentinel AI™ is an enterprise-grade AI Flash Flood Early Warning & 3D Topographic Digital Twin platform powered by **Team Quantum Minds**.

---

## ⚡ 1. Local Production Deployment

### Quick Launch (Windows):
Double-click `deploy.bat` or run:
```powershell
.\deploy.bat
```

### Manual Start:
```bash
# 1. Install dependencies
pip install -r requirements.txt gunicorn waitress

# 2. Run automated test verification (22 tests)
pytest tests/ -v

# 3. Launch production server
python app.py
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🐳 2. Docker & Container Deployment

### Build and Run with Docker Compose:
```bash
docker-compose up --build -d
```

### Standard Docker Build:
```bash
docker build -t hydrosentinel-ai .
docker run -d -p 5000:5000 --name hydrosentinel hydrosentinel-ai
```

---

## ☁️ 3. One-Click Cloud Platform Deployment

### A. Render.com
1. Fork or push this repository to GitHub.
2. In Render Dashboard, click **New +** → **Blueprint**.
3. Connect your repository — Render will automatically detect `render.yaml` and configure:
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt gunicorn`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --threads 2`
4. Click **Apply** to deploy live.

### B. Railway.app / Fly.io / Heroku
- **Buildpack**: `heroku/python`
- **Procfile** (pre-configured):
  ```text
  web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --threads 2
  ```

### C. AWS ECS / Google Cloud Run / Azure Container Apps
Push the Docker container directly:
```bash
# Google Cloud Run Example:
gcloud builds submit --tag gcr.io/PROJECT-ID/hydrosentinel-ai
gcloud run deploy hydrosentinel-ai --image gcr.io/PROJECT-ID/hydrosentinel-ai --platform managed --port 5000 --allow-unauthenticated
```

---

## 📡 4. Production REST API Endpoints

| Endpoint | Method | Output Format | Description |
| :--- | :---: | :---: | :--- |
| `/api/live-telemetry` | `GET` | `JSON` | Real-time sensor stream & ensemble prediction |
| `/api/stations` | `GET` | `JSON` | 8-Basin catchment catalog & status |
| `/api/timeseries` | `GET` | `JSON` | 24-Hour hourly telemetry curve & soil layers |
| `/api/basin-risk-matrix`| `GET` | `JSON` | Multi-catchment comparative rankings |
| `/api/weather-radar` | `GET` | `JSON` | Doppler cloudburst reflectivity & echo top |
| `/api/export-geojson` | `GET` | `GeoJSON` | RFC-7946 Polygon catchment boundaries |
| `/api/export-csv` | `GET` | `CSV` | RFC-4180 24h Telemetry Time-Series Export |
| `/api/export-cap-alert`| `GET` | `XML` | OASIS CAP v1.2 Standard Alert Payload |
| `/api/ingestion-status`| `GET` | `JSON` | NASA GPM, Sentinel SAR, NWP & LoRaWAN Health |
| `/api/ingest/custom` | `POST` | `JSON` | External IoT Field Sensor Ingestion Endpoint |

---

## 🧪 5. Automated Verification Test Suite

Run the full automated test suite covering all routes, ML pipelines, and API feeds:
```bash
pytest tests/ -v
```
**Status: 22/22 Passing (100% Code Coverage)**
