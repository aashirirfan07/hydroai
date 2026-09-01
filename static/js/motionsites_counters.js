/* ==========================================================================
   MOTIONSITES.AI KINETIC NUMBER COUNT-UP & INTERACTIVE SPOTLIGHT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMotionSitesCounters();
    initDotGridSpotlight();
});

// 1. Kinetic Number Roll-Up on Scroll
function initMotionSitesCounters() {
    const counterElements = document.querySelectorAll('.about-stat-num, .widget-value, .gauge-number, .score-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = "true";
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.2 });

    counterElements.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const text = el.innerText.trim();
    const match = text.match(/([0-9.]+)/);
    if (!match) return;

    const targetVal = parseFloat(match[1]);
    const suffix = text.replace(match[1], '');
    const isDecimal = match[1].includes('.');
    const decimals = isDecimal ? match[1].split('.')[1].length : 0;

    let startVal = 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease Out Cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = startVal + (targetVal - startVal) * easeOut;

        el.innerText = `${currentVal.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.innerText = text;
        }
    }
    requestAnimationFrame(update);
}

// 2. MotionSites Interactive Micro-Dot Spotlight
function initDotGridSpotlight() {
    const dotGrid = document.querySelector('.cyber-grid-backdrop');
    if (!dotGrid) return;

    document.addEventListener('mousemove', (e) => {
        dotGrid.style.setProperty('--spotlight-x', `${e.clientX}px`);
        dotGrid.style.setProperty('--spotlight-y', `${e.clientY}px`);
    }, { passive: true });
}
