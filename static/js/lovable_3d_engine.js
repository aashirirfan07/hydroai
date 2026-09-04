/**
 * Lovable 3D UI & Spatial Depth Engine
 * ====================================
 * Powers interactive 3D perspective tilt, dynamic specular lighting,
 * and holographic depth layers across all website surfaces.
 */

(function () {
    'use strict';

    // 1. Interactive 3D Card Tilt with Specular Sheen
    function initLovable3DTilt() {
        const tiltElements = document.querySelectorAll(
            '.card, .telemetry-widget, .spatial-interactive-viewer-card, .metric-pill, .twin-space-hud-badge, .drawer-3d-card'
        );

        tiltElements.forEach(el => {
            if (el.dataset.tiltInitialized) return;
            el.dataset.tiltInitialized = 'true';

            // Add preserve-3d styling
            el.style.transformStyle = 'preserve-3d';
            el.style.transition = 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.25s ease';

            // Create specular glare sheen element
            let glare = el.querySelector('.lovable-specular-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'lovable-specular-glare';
                glare.style.position = 'absolute';
                glare.style.inset = '0';
                glare.style.pointerEvents = 'none';
                glare.style.borderRadius = 'inherit';
                glare.style.opacity = '0';
                glare.style.transition = 'opacity 0.25s ease';
                glare.style.zIndex = '3';
                el.appendChild(glare);
            }

            // Ensure parent allows 3D perspective
            if (el.parentElement) {
                el.parentElement.style.perspective = '1200px';
            }

            let isHovered = false;
            let rafId = null;

            el.addEventListener('mouseenter', () => {
                isHovered = true;
                glare.style.opacity = '1';
                el.style.transition = 'transform 0.08s ease-out, box-shadow 0.25s ease';
            });

            el.addEventListener('mousemove', (e) => {
                if (!isHovered) return;
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Calculate rotation angles (max +/- 8 degrees)
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    // Apply 3D perspective transform
                    el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

                    // Specular light radial highlight following mouse
                    const pctX = (x / rect.width) * 100;
                    const pctY = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle 240px at ${pctX}% ${pctY}%, rgba(255, 255, 255, 0.16), transparent 75%)`;

                    // Subtle 3D pop for inner elements
                    const pops = el.querySelectorAll('h2, h3, .widget-value, .badge, img, .pulse-beacon, .btn');
                    pops.forEach(p => {
                        p.style.transform = 'translateZ(18px)';
                        p.style.transformStyle = 'preserve-3d';
                    });
                });
            });

            el.addEventListener('mouseleave', () => {
                isHovered = false;
                if (rafId) cancelAnimationFrame(rafId);
                glare.style.opacity = '0';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
                el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

                const pops = el.querySelectorAll('h2, h3, .widget-value, .badge, img, .pulse-beacon, .btn');
                pops.forEach(p => {
                    p.style.transform = 'translateZ(0px)';
                });
            });
        });
    }

    // 2. 3D Camera Presets for Digital Twin Viewport
    window.setLovable3DCameraPreset = function (preset) {
        if (!window.currentControls || !window.currentCamera) {
            console.log('3D controls not ready yet for preset:', preset);
            return;
        }
        const controls = window.currentControls;
        const camera = window.currentCamera;

        switch (preset) {
            case 'orbit':
                camera.position.set(25, 22, 28);
                controls.target.set(0, 0, 0);
                break;
            case 'satellite':
                // Nadir vertical satellite view
                camera.position.set(0, 48, 0.1);
                controls.target.set(0, 0, 0);
                break;
            case 'isometric':
                camera.position.set(30, 25, 30);
                controls.target.set(0, 0, 0);
                break;
            case 'gorge':
                // Low altitude valley cross-section
                camera.position.set(-18, 6, 12);
                controls.target.set(0, 3, 0);
                break;
        }
        controls.update();

        // Update active preset button
        document.querySelectorAll('.btn-cam-preset').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === preset) btn.classList.add('active');
        });
    };

    // Initialize on DOM load and when tabs change
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLovable3DTilt);
    } else {
        initLovable3DTilt();
    }

    // Re-bind when dynamic content is inserted
    window.refreshLovable3D = initLovable3DTilt;
})();
