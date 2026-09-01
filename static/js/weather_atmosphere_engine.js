
/* ==========================================================================
   ⛈️ WEATHER-REACTIVE DYNAMIC ATMOSPHERE ENGINE (HYDROSENTINEL AI)
   - Real-Time Global UI Theme Morphing: Cloudburst, Clear, FLIR Thermal, Surge
   - Procedural Screen-Wide Lightning Flashes
   - Dynamic Rain Screen Streaks & Specular Environmental Highlights
   ========================================================================== */

let currentGlobalAtmosphere = 'cloudburst';
let lightningTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    initAtmosphereEngine();
});

function initAtmosphereEngine() {
    // Check saved state or default to cloudburst
    const saved = localStorage.getItem('hydro_atmosphere') || 'cloudburst';
    setGlobalAtmosphere(saved, false);
    scheduleProceduralLightning();
}

function setGlobalAtmosphere(mode, save = true) {
    currentGlobalAtmosphere = mode;
    if (save) localStorage.setItem('hydro_atmosphere', mode);

    const body = document.body;
    body.classList.remove('atmo-cloudburst', 'atmo-clear', 'atmo-thermal', 'atmo-surge');
    body.classList.add(`atmo-${mode}`);

    // Update active pill badge
    const badge = document.getElementById('atmoCurrentModeText');
    if (badge) {
        const labels = {
            'cloudburst': '⛈️ Cloudburst Storm',
            'clear': '☀️ Calm Sunlit',
            'thermal': '🎯 FLIR Thermal',
            'surge': '🚨 Critical Inundation'
        };
        badge.innerText = labels[mode] || mode;
    }

    // Sync with 3D Three.js scene if active
    if (typeof set3DAtmosphere === 'function') {
        set3DAtmosphere(mode === 'cloudburst' ? 'cloudburst' : (mode === 'thermal' ? 'overcast' : 'clear'));
    }

    // Adjust 3D Scene Fog & Lights
    if (typeof scene !== 'undefined' && scene.fog) {
        if (mode === 'cloudburst') {
            scene.fog.color.setHex(0x02040a);
            scene.fog.density = 0.015;
        } else if (mode === 'thermal') {
            scene.fog.color.setHex(0x03140c);
            scene.fog.density = 0.01;
        } else if (mode === 'surge') {
            scene.fog.color.setHex(0x170206);
            scene.fog.density = 0.012;
        } else {
            scene.fog.color.setHex(0x040714);
            scene.fog.density = 0.006;
        }
    }
}

function toggleNextAtmosphere() {
    const modes = ['cloudburst', 'clear', 'thermal', 'surge'];
    const nextIdx = (modes.indexOf(currentGlobalAtmosphere) + 1) % modes.length;
    setGlobalAtmosphere(modes[nextIdx]);
}

// Procedural Lightning Flashes across Glass Cards (Active in Cloudburst Mode)
function scheduleProceduralLightning() {
    if (lightningTimer) clearTimeout(lightningTimer);

    const randomDelay = Math.random() * 8000 + 4000; // 4 - 12 seconds
    lightningTimer = setTimeout(() => {
        if (currentGlobalAtmosphere === 'cloudburst') {
            triggerScreenLightning();
        }
        scheduleProceduralLightning();
    }, randomDelay);
}

function triggerScreenLightning() {
    const flashEl = document.getElementById('globalLightningFlash');
    if (!flashEl) return;

    flashEl.classList.add('flash-active');
    setTimeout(() => {
        flashEl.classList.remove('flash-active');
    }, 180);

    // Double flash flicker
    if (Math.random() > 0.4) {
        setTimeout(() => {
            flashEl.classList.add('flash-active');
            setTimeout(() => { flashEl.classList.remove('flash-active'); }, 120);
        }, 280);
    }
}
