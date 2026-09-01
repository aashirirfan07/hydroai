/* ==========================================================================
   HYDROSENTINEL AI™ - ANDROID NATIVE OPTIMIZATION SUITE (Chrome & Samsung Internet)
   - Material Ink-Ripple Physics on Touch
   - WebGL Context Lost / Restoration Auto-Recovery
   - Android Native Share API & PWA Install Prompt
   ========================================================================== */

let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    initAndroidMaterialRipples();
    initAndroidWebGLGuards();
    initAndroidPWAInstallBanner();
});

// 1. Android Material Ink-Ripple Effect
function initAndroidMaterialRipples() {
    document.querySelectorAll('.btn, .mob-nav-item, .drawer-3d-card, .btn-pill').forEach(el => {
        el.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('material-ripple-effect');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            const existing = this.querySelector('.material-ripple-effect');
            if (existing) existing.remove();

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// 2. Android WebGL GPU Context Lost Auto-Recovery
function initAndroidWebGLGuards() {
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[HydroSentinel Android] WebGL context lost. Restoring...');
        }, false);
        canvas.addEventListener('webglcontextrestored', () => {
            console.log('[HydroSentinel Android] WebGL context restored successfully.');
        }, false);
    });
}

// 3. Android PWA Install Prompt Handler & Native Share
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const banner = document.getElementById('androidInstallBanner');
    if (banner) banner.style.display = 'flex';
});

function triggerAndroidPWAInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
            deferredInstallPrompt = null;
            const banner = document.getElementById('androidInstallBanner');
            if (banner) banner.style.display = 'none';
        });
    }
}

function triggerNativeAndroidShare() {
    if (navigator.share) {
        navigator.share({
            title: 'HydroSentinel AI™ - Flash Flood Intelligence',
            text: 'Live 3D AI Flash Flood Early Warning & Topographic Digital Twin by Team Quantum Minds',
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Platform URL copied to clipboard!');
    }
}
