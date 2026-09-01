/* ==========================================================================
   REAL-TIME 3D CATCHMENT BASIN SURGE VIEWER FOR SIMULATOR (/predict)
   ========================================================================== */

let basinScene, basinCamera, basinRenderer, basinMesh, waterPlaneMesh;

document.addEventListener('DOMContentLoaded', () => {
    initPredict3DBasin();
});

function initPredict3DBasin() {
    const container = document.getElementById('predict3DBasinViewer');
    if (!container || typeof THREE === 'undefined') return;

    basinScene = new THREE.Scene();
    basinCamera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    basinCamera.position.set(0, 24, 38);

    basinRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    basinRenderer.setSize(container.offsetWidth, container.offsetHeight);
    basinRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(basinRenderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
        const controls = new THREE.OrbitControls(basinCamera, basinRenderer.domElement);
        controls.enableZoom = false; // Never block desktop page scrolling
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
    }

    // Mountain Basin Geometry
    const basinGeo = new THREE.PlaneGeometry(32, 32, 28, 28);
    const pos = basinGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = Math.sin(Math.sqrt(x * x + y * y) * 0.3) * 4.5 - Math.cos(x * 0.4) * 2.5 + Math.random() * 0.2;
        pos.setZ(i, z);
    }
    basinGeo.computeVertexNormals();

    const basinMat = new THREE.MeshStandardMaterial({
        color: 0x0f3460,
        wireframe: true,
        roughness: 0.6,
        metalness: 0.4
    });

    basinMesh = new THREE.Mesh(basinGeo, basinMat);
    basinMesh.rotation.x = -Math.PI / 2;
    basinScene.add(basinMesh);

    // 3D Flood Water Plane
    const waterGeo = new THREE.PlaneGeometry(30, 30);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        metalness: 0.8
    });
    waterPlaneMesh = new THREE.Mesh(waterGeo, waterMat);
    waterPlaneMesh.rotation.x = -Math.PI / 2;
    waterPlaneMesh.position.y = 0.5;
    basinScene.add(waterPlaneMesh);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    basinScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight.position.set(20, 40, 20);
    basinScene.add(dirLight);

    function animateBasin() {
        requestAnimationFrame(animateBasin);
        if (basinRenderer) basinRenderer.render(basinScene, basinCamera);
    }
    animateBasin();

    window.addEventListener('resize', () => {
        if (!container || !basinRenderer || !basinCamera) return;
        basinCamera.aspect = container.offsetWidth / container.offsetHeight;
        basinCamera.updateProjectionMatrix();
        basinRenderer.setSize(container.offsetWidth, container.offsetHeight);
    });
}

function update3DBasinFromInputs(rainfall, soil, waterLevel) {
    if (!waterPlaneMesh || !basinMesh) return;
    const r = parseFloat(rainfall) || 40;
    const s = parseFloat(soil) || 50;
    const w = parseFloat(waterLevel) || 3;

    waterPlaneMesh.position.y = (w - 2.5) * 0.8;
    if (r > 65 || s > 80) {
        waterPlaneMesh.material.color.setHex(0xf43f5e); // Red flood surge
        basinMesh.material.color.setHex(0xf43f5e);
    } else if (r > 35 || s > 60) {
        waterPlaneMesh.material.color.setHex(0xf59e0b); // Amber warning
        basinMesh.material.color.setHex(0xf59e0b);
    } else {
        waterPlaneMesh.material.color.setHex(0x00f0ff); // Normal cyan
        basinMesh.material.color.setHex(0x0f3460);
    }
}
