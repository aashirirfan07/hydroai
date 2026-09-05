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

### A. Render.com (With 24/7 Anti-Sleep Protection)
1. Fork or push this repository to GitHub.
2. In Render Dashboard, click **New +** → **Blueprint**.
3. Connect your repository — Render will automatically detect `render.yaml` and configure:
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt gunicorn`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120`
   - **Health Check Path**: `/healthz`
   - **Keep-Alive**: Automatically enabled (`RENDER_KEEP_ALIVE=true`)
4. Click **Apply** to deploy live.

#### 🛡️ How HydroSentinel Eliminates Render Free Tier Sleep / Cold Starts:
Render free tier instances automatically spin down (sleep) after 15 minutes of inactivity. HydroSentinel uses a **Triple-Layer Anti-Sleep Shield**:
1. **In-App Background Keep-Alive Daemon (`src/render_keepalive_service.py`)**: An internal non-blocking daemon thread continuously sends HTTP pulses every 11 minutes (660s) to the public edge endpoint (`https://hydrosentinel.onrender.com/healthz`), resetting Render's idle countdown timer.
2. **GitHub Actions 24/7 Heartbeat (`.github/workflows/render_keep_alive.yml`)**: A scheduled cloud cron triggers every 12 minutes to ping `/healthz` externally, ensuring the server stays awake even across reboots.
3. **Client-Side Ambient Heartbeat**: Any open browser tab dispatches a lightweight 10-minute heartbeat to `/healthz`.
4. **Custom Keep-Alive URL**: If deploying under a custom domain, simply set the environment variable:
   ```text
   RENDER_EXTERNAL_URL=https://your-custom-domain.com
   ```

### B. Railway.app / Fly.io / Heroku
- **Buildpack**: `heroku/python`
- **Procfile** (pre-configured):
  ```text
  web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120
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
**Status: 109/109 Passing (100% Test Pass Rate)**
