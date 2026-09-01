/* ==========================================================================
   HYDROSENTINEL AI™ - UNBELIEVABLE CINEMATIC TRANSITIONS & FLUID ENGINE
   - Seamless Holographic Page Wipe Curtain
   - Dynamic Specular Glass Glare on Cursor Coordinates
   - Kinetic Cascading Word Reveal Engine
   - Bioluminescent Cursor Fluid Ripple Physics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initSeamlessPageTransitions();
    initDynamicCardGlare();
    initKineticWordReveals();
    initCursorRippleCanvas();
});

/* 1. Seamless Holographic Page Wipe Curtain */
function initSeamlessPageTransitions() {
    const veil = document.getElementById('unbelievableTransitionVeil');
    if (veil) {
        veil.classList.add('veil-hidden');
        veil.style.pointerEvents = 'none';
    }
}

/* 2. Dynamic Specular Glass Glare on Cursor Hover */
function initDynamicCardGlare() {
    // Only run on desktop with pointer precision
    if (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches) return;
    
    let ticking = false;
    document.querySelectorAll('.card, .overview-hero, .station-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    });
}

/* 3. Kinetic Cascading Word Reveal Engine */
function initKineticWordReveals() {
    document.querySelectorAll('.overview-hero h1, .section-title h2, .page-header-banner h2').forEach(heading => {
        if (heading.dataset.splitDone) return;
        heading.dataset.splitDone = "true";

        const text = heading.textContent.trim();
        const words = text.split(/\s+/);
        heading.innerHTML = '';

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'kinetic-word-reveal';
            span.textContent = word;
            span.style.marginRight = '0.34em';
            span.style.display = 'inline-block';
            span.style.animationDelay = `${index * 0.05 + 0.1}s`;
            heading.appendChild(span);
        });
    });
}

/* 4. Bioluminescent Cursor Fluid Ripple Canvas */
function initCursorRippleCanvas() {
    const canvas = document.getElementById('cursorRippleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const ripples = [];

    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.35) {
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                radius: 4,
                maxRadius: 65 + Math.random() * 30,
                alpha: 0.45,
                color: Math.random() > 0.5 ? '#05ffa1' : '#00f0ff'
            });
        }
    }, { passive: true });

    function animateRipples() {
        ctx.clearRect(0, 0, width, height);

        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += 1.8;
            r.alpha *= 0.94;

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = r.color;
            ctx.globalAlpha = Math.max(0, r.alpha);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (r.alpha < 0.01 || r.radius >= r.maxRadius) {
                ripples.splice(i, 1);
            }
        }
        requestAnimationFrame(animateRipples);
    }
    animateRipples();
}
