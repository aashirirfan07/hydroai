/* ==========================================================================
   ULTRA-OPTIMIZED 120Hz ADAPTIVE BACKGROUND ENGINE
   - On Mobile (<768px): Uses ultra-fast pure CSS hardware rasterization
   - On Desktop (>=768px): Full high-performance 3D WebGL particle space
   ========================================================================== */

let bgScene, bgCamera, bgRenderer, starfieldMesh;
let isPageVisible = true;

document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
});

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
    const canvas = document.getElementById('ambient3DCanvas');

    // On mobile devices, hide canvas to save 100% GPU memory for 120FPS native scroll
    if (isMobile) {
        if (canvas) canvas.style.display = 'none';
        return;
    }

    initDesktop3DBackground(canvas);
});

function initDesktop3DBackground(canvas) {
    if (!canvas || typeof THREE === 'undefined') return;

    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 100;

    bgRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance"
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 800;
        starPos[i + 1] = (Math.random() - 0.5) * 800;
        starPos[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 2.0,
        transparent: true,
        opacity: 0.6
    });

    starfieldMesh = new THREE.Points(starGeo, starMat);
    bgScene.add(starfieldMesh);

    function animate() {
        requestAnimationFrame(animate);
        if (!isPageVisible) return;
        if (starfieldMesh) {
            starfieldMesh.rotation.y += 0.0005;
        }
        bgRenderer.render(bgScene, bgCamera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (!bgCamera || !bgRenderer) return;
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
}

function adjustGlobalFontSize(delta) {
    let current = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let next = Math.min(20, Math.max(13, current + delta));
    document.documentElement.style.fontSize = `${next}px`;
    try { localStorage.setItem('hydro_font_size', next); } catch(e) {}
}
