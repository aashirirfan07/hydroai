/* ==========================================================================
   HYDROSENTINEL AI™ - ADVANCED MOBILE NATIVE SUITE
   - Hardware Haptic Vibration Feedback (HTML5 Vibration API)
   - Gyroscope & Accelerometer 3D Device Tilt Parallax
   - Touch Swipe Left/Right Gesture Navigation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initHardwareHaptics();
    initMobileGyroscopeTilt();
    initMobileSwipeGestures();
});

// 1. Hardware Haptic Vibration Feedback
function triggerHaptic(type = 'light') {
    if (!navigator.vibrate) return;
    try {
        if (type === 'light') navigator.vibrate(15);
        else if (type === 'medium') navigator.vibrate([25, 20, 25]);
        else if (type === 'warning') navigator.vibrate([40, 30, 40]);
        else if (type === 'critical') navigator.vibrate([100, 50, 100, 50, 150]);
    } catch(e) {}
}

function initHardwareHaptics() {
    // Attach haptics to buttons, links, and drawer
    document.querySelectorAll('.btn, .mob-nav-item, .drawer-3d-card, .tab-btn').forEach(el => {
        el.addEventListener('touchstart', () => triggerHaptic('light'), { passive: true });
    });

    document.querySelectorAll('.btn-siren-pill, .btn-danger, #triggerSirenBtn').forEach(el => {
        el.addEventListener('touchstart', () => triggerHaptic('critical'), { passive: true });
    });
}

// 2. Gyroscope & Accelerometer 3D Tilt Parallax
function initMobileGyroscopeTilt() {
    if (!window.DeviceOrientationEvent) return;

    window.addEventListener('deviceorientation', (e) => {
        if (e.beta === null || e.gamma === null) return;

        // Clamp tilt angles
        const tiltX = Math.max(-25, Math.min(25, e.gamma)) * 0.4; // left/right
        const tiltY = Math.max(-25, Math.min(25, e.beta - 45)) * 0.4; // front/back

        const heroOrb = document.getElementById('hero3DViewer');
        if (heroOrb) {
            heroOrb.style.transform = `perspective(800px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
        }

        document.querySelectorAll('.overview-hero, .quantum-mind-branding-card').forEach(card => {
            card.style.setProperty('--gyro-x', `${tiltX}px`);
            card.style.setProperty('--gyro-y', `${tiltY}px`);
        });
    }, { passive: true });
}

// 3. Touch Swipe Gestures for Station Switching on Dashboard
function initMobileSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;

    const swipeZone = document.getElementById('liveDataPanel') || document.querySelector('.dashboard-grid');
    if (!swipeZone) return;

    swipeZone.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    swipeZone.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(e.changedTouches[0].screenY - touchStartY);

        // Horizontal swipe detected (diffX > 60px and diffY < 50px)
        if (Math.abs(diffX) > 60 && diffY < 50) {
            triggerHaptic('medium');
            const selectEl = document.getElementById('stationSelect');
            if (selectEl) {
                let currentIndex = selectEl.selectedIndex;
                if (diffX < 0 && currentIndex < selectEl.options.length - 1) {
                    selectEl.selectedIndex = currentIndex + 1; // Swipe left -> next station
                } else if (diffX > 0 && currentIndex > 0) {
                    selectEl.selectedIndex = currentIndex - 1; // Swipe right -> prev station
                }
                selectEl.dispatchEvent(new Event('change'));
            }
        }
    }, { passive: true });
}
