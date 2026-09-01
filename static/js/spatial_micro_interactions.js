
/* ==========================================================================
   ✨ SPATIAL MICRO-INTERACTIONS ENGINE
   - 3D Spring-Tilt Parallax Cards
   - Mouse-Reactive Glowing Border Beams (Raycast Spotlight)
   - Dynamic Island Navbar Shrink on Scroll
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBorderBeamSpotlight();
    init3DTiltCards();
    initDynamicIslandNavbar();
});

// 1. Mouse-Reactive Glowing Border Beams
function initBorderBeamSpotlight() {
    const cards = document.querySelectorAll('.spatial-card, .station-glass-card, .panel, .telemetry-widget, .stat-card, .arch-card, .spatial-interactive-viewer-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// 2. 3D Spring-Tilt Parallax on Hover
function init3DTiltCards() {
    const tiltElements = document.querySelectorAll('.spatial-card, .station-glass-card, .hero-action-pills a, .btn-pilot-drone-glow');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg pitch
            const rotateY = ((x - centerX) / centerX) * 10;  // Max 10 deg roll
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none'; // Instant responsive follow
        });
    });
}

// 3. Dynamic Island Navbar Shrink on Scroll
function initDynamicIslandNavbar() {
    const navbar = document.querySelector('.navbar-floating-inner');
    if (!navbar) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled-compact');
        } else {
            navbar.classList.remove('scrolled-compact');
        }
        lastScrollY = window.scrollY;
    }, { passive: true });
}
