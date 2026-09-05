import os
import time
import threading
import urllib.request
import urllib.error
import logging
from datetime import datetime, timezone

logger = logging.getLogger("HydroSentinel.KeepAlive")

class RenderKeepAliveService:
    '''
    Autonomous Keep-Alive Service for Render.com Free Tier
    ------------------------------------------------------
    Render spins down free web instances after 15 minutes of inactivity.
    This service runs a non-blocking background daemon thread that dispatches
    an HTTP keep-alive pulse every 11 minutes (660s) to the public edge endpoint,
    resetting Render's idle counter and keeping the app awake 24/7.
    '''
    def __init__(self):
        self._lock = threading.Lock()
        self._thread = None
        self._stop_event = threading.Event()
        self.start_time = time.time()
        self.last_ping_time = None
        self.last_status_code = None
        self.last_error = None
        self.total_pings = 0
        self.successful_pings = 0
        self.failed_pings = 0
        
        # Ping interval: 11 minutes (660 seconds), well within Render's 15-minute sleep threshold
        self.interval_seconds = int(os.environ.get('RENDER_PING_INTERVAL_SEC', 660))
        
        # Determine public target URL
        self.target_url = self._resolve_target_url()
        self.is_render = bool(os.environ.get('RENDER') or os.environ.get('RENDER_EXTERNAL_URL'))
        self.is_enabled = os.environ.get('RENDER_KEEP_ALIVE', 'true').lower() in ('true', '1', 'yes')

    def _resolve_target_url(self) -> str:
        url = (
            os.environ.get('RENDER_EXTERNAL_URL') or
            os.environ.get('KEEP_ALIVE_URL') or
            (f"https://{os.environ.get('RENDER_EXTERNAL_HOSTNAME')}" if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else None) or
            "https://hydrosentinel.onrender.com"
        )
        return url.rstrip('/')

    def start_worker(self):
        '''Starts the background keep-alive daemon thread if enabled.'''
        with self._lock:
            if self._thread and self._thread.is_alive():
                return
            
            self._stop_event.clear()
            self._thread = threading.Thread(target=self._run_loop, name="RenderKeepAliveDaemon", daemon=True)
            self._thread.start()
            logger.info(f"Render Keep-Alive Service started. Target: {self.target_url}, Interval: {self.interval_seconds}s")

    def stop_worker(self):
        '''Stops the keep-alive daemon thread.'''
        self._stop_event.set()

    def _run_loop(self):
        '''Background loop executing regular keep-alive pings.'''
        # Initial sleep to let server boot
        time.sleep(15)
        
        while not self._stop_event.is_set():
            try:
                if self.is_enabled:
                    self.ping_now()
            except Exception as e:
                logger.warning(f"Keep-alive pulse error: {e}")
            
            # Interruptible sleep
            for _ in range(self.interval_seconds):
                if self._stop_event.is_set():
                    break
                time.sleep(1)

    def ping_now(self) -> dict:
        '''Sends an immediate HTTP GET request to the health endpoint.'''
        ping_endpoint = f"{self.target_url}/healthz"
        t0 = time.time()
        self.total_pings += 1
        self.last_ping_time = datetime.now(timezone.utc).isoformat()
        
        try:
            req = urllib.request.Request(
                ping_endpoint,
                headers={
                    'User-Agent': 'HydroSentinel-KeepAlive-Pulse/2.9 (+https://hydrosentinel.onrender.com)',
                    'Accept': 'application/json'
                }
            )
            with urllib.request.urlopen(req, timeout=20) as response:
                latency_ms = round((time.time() - t0) * 1000, 2)
                self.last_status_code = response.getcode()
                self.last_error = None
                self.successful_pings += 1
                logger.info(f"Keep-Alive Pulse SUCCESS -> {ping_endpoint} [{self.last_status_code}] in {latency_ms}ms")
                return {
                    "status": "SUCCESS",
                    "url": ping_endpoint,
                    "code": self.last_status_code,
                    "latency_ms": latency_ms,
                    "timestamp": self.last_ping_time
                }
        except Exception as ex:
            latency_ms = round((time.time() - t0) * 1000, 2)
            self.failed_pings += 1
            self.last_error = str(ex)
            self.last_status_code = getattr(ex, 'code', 500)
            logger.warning(f"Keep-Alive Pulse Ping -> {ping_endpoint} returned {self.last_status_code} ({ex}) in {latency_ms}ms")
            return {
                "status": "FAILED",
                "url": ping_endpoint,
                "code": self.last_status_code,
                "error": str(ex),
                "latency_ms": latency_ms,
                "timestamp": self.last_ping_time
            }

    def get_status(self) -> dict:
        '''Returns diagnostic telemetry of the keep-alive service.'''
        uptime = round(time.time() - self.start_time, 1)
        return {
            "service_name": "Render Anti-Sleep Keep-Alive Service",
            "is_enabled": self.is_enabled,
            "is_render_environment": self.is_render,
            "target_url": self.target_url,
            "interval_seconds": self.interval_seconds,
            "total_pings": self.total_pings,
            "successful_pings": self.successful_pings,
            "failed_pings": self.failed_pings,
            "last_ping_time": self.last_ping_time,
            "last_status_code": self.last_status_code,
            "last_error": self.last_error,
            "uptime_seconds": uptime,
            "is_alive": bool(self._thread and self._thread.is_alive())
        }

render_keepalive_service = RenderKeepAliveService()
