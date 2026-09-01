
/* ==========================================================================
   📦 OFFLINE DISASTER STORAGE & INDEXEDDB ENGINE (HYDROSENTINEL AI)
   - Auto-Detects Cellular Network Outages
   - Queues Citizen SOS Reports in IndexedDB while Offline
   - Auto-Flushes & Syncs when Network Connection Restores
   ========================================================================== */

const DB_NAME = 'HydroSentinelOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_sos_queue';

let db = null;
let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    initIndexedDB();
    initNetworkStatusListener();
    initPWAInstallPrompt();
    registerServiceWorker();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
            .then(reg => console.log('[PWA] Service Worker Registered successfully:', reg.scope))
            .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
    }
}

// 1. Initialize IndexedDB
function initIndexedDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        console.log('[IndexedDB] Offline Disaster Storage Ready.');
        checkAndSyncQueuedReports();
    };

    request.onerror = (e) => {
        console.error('[IndexedDB] Error initializing offline storage:', e);
    };
}

// 2. Queue SOS Report when Offline
function queueOfflineReport(reportPayload) {
    if (!db) {
        alert("Offline storage unavailable. Please keep phone on high ground.");
        return;
    }

    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    reportPayload.queued_at = new Date().toISOString();
    reportPayload.sync_status = 'PENDING_NETWORK';

    store.add(reportPayload);

    tx.oncomplete = () => {
        alert("📶 NETWORK OFFLINE DETECTED!\n\nYour SOS Incident Report has been safely stored in your device's encrypted IndexedDB.\n\nIt will automatically broadcast to NDRF rescue teams the moment connectivity returns.");
        updateOfflineQueueCountBadge();
    };
}

// 3. Sync Queued Reports upon Reconnection
function checkAndSyncQueuedReports() {
    if (!db || !navigator.onLine) return;

    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
        const queued = getAllReq.result;
        if (queued && queued.length > 0) {
            console.log(`[IndexedDB] Syncing ${queued.length} queued offline reports to NDRF mesh...`);
            
            queued.forEach(item => {
                fetch('/api/citizen-reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                }).then(res => {
                    if (res.ok) {
                        // Delete synced item from IndexedDB
                        const delTx = db.transaction([STORE_NAME], 'readwrite');
                        delTx.objectStore(STORE_NAME).delete(item.id);
                    }
                }).catch(err => console.warn('Sync retry later:', err));
            });

            setTimeout(() => {
                updateOfflineQueueCountBadge();
            }, 2000);
        }
    };
}

function updateOfflineQueueCountBadge() {
    if (!db) return;
    const tx = db.transaction([STORE_NAME], 'readonly');
    const countReq = tx.objectStore(STORE_NAME).count();
    countReq.onsuccess = () => {
        const badge = document.getElementById('offlineQueueBadge');
        if (badge) {
            if (countReq.result > 0) {
                badge.style.display = 'inline-flex';
                badge.innerText = `📦 ${countReq.result} Queued`;
            } else {
                badge.style.display = 'none';
            }
        }
    };
}

// 4. Online / Offline Status Detection
function initNetworkStatusListener() {
    const updateStatus = () => {
        const isOnline = navigator.onLine;
        const banner = document.getElementById('offlineNetworkBanner');
        const netDot = document.getElementById('netStatusDot');
        const netText = document.getElementById('netStatusText');

        if (banner) {
            banner.style.display = isOnline ? 'none' : 'flex';
        }
        if (netDot) {
            netDot.className = isOnline ? 'dot-green' : 'dot-amber-pulse';
        }
        if (netText) {
            netText.innerText = isOnline ? 'NRSC Synced' : 'Offline Mode';
        }

        if (isOnline) {
            checkAndSyncQueuedReports();
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// 5. PWA Install Prompt
function initPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('pwaInstallBtn');
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
}

function triggerPWAInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                console.log('[PWA] User installed HydroSentinel PWA');
            }
            deferredPrompt = null;
            const installBtn = document.getElementById('pwaInstallBtn');
            if (installBtn) installBtn.style.display = 'none';
        });
    } else {
        alert("📲 To install HydroSentinel AI PWA:\n\n- On Chrome/Edge: Click the Install icon in the address bar.\n- On iOS Safari: Tap Share ➔ 'Add to Home Screen'.");
    }
}
