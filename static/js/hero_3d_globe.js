/* ==========================================================================
   HYDROSENTINEL AI™ - 3D INTERACTIVE HERO DIGITAL TWIN (MOTIONSITE.AI STYLE)
   ========================================================================== */

let heroScene, heroCamera, heroRenderer, heroTerrainOrb, heroWireframe;
let heroControls;

document.addEventListener('DOMContentLoaded', () => {
    initHero3DOrb();
});

function initHero3DOrb() {
    const container = document.getElementById('hero3DViewer');
    if (!container) return;

    heroScene = new THREE.Scene();
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 450;

    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    heroCamera.position.set(0, 15, 38);

    heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(heroRenderer.domElement);

    // Orbit Controls
    heroControls = new THREE.OrbitControls(heroCamera, heroRenderer.domElement);
    heroControls.enableDamping = true;
    heroControls.dampingFactor = 0.05;
    heroControls.autoRotate = true;
    heroControls.autoRotateSpeed = 1.4;
    heroControls.enableZoom = false;

    // Lighting
    const amb = new THREE.AmbientLight(0x00f0ff, 1.2);
    heroScene.add(amb);

    const dir = new THREE.DirectionalLight(0xffb703, 2.2);
    dir.position.set(20, 30, 20);
    heroScene.add(dir);

    const rim = new THREE.DirectionalLight(0x7928ca, 1.8);
    rim.position.set(-20, -10, -20);
    heroScene.add(rim);

    // Build 3D Mountainous Terrain Globe
    const geo = new THREE.IcosahedronGeometry(12, 32);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
        const noise = Math.sin(v.x * 0.4) * Math.cos(v.y * 0.4) * Math.sin(v.z * 0.4) * 2.2;
        v.normalize().multiplyScalar(12 + noise);
        pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
        color: 0x050d24,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.8,
        clearcoat: 0.6,
        wireframe: false
    });

    heroTerrainOrb = new THREE.Mesh(geo, mat);
    heroScene.add(heroTerrainOrb);

    // Holographic Wireframe Overlay
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.35
    });
    heroWireframe = new THREE.Mesh(geo.clone(), wireMat);
    heroWireframe.scale.set(1.02, 1.02, 1.02);
    heroScene.add(heroWireframe);

    // Floating Sensor Beacons around Orb
    for (let b = 0; b < 6; b++) {
        const beaconGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: b % 2 === 0 ? 0x00f0ff : 0xff2a5f
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        beacon.position.setFromSphericalCoords(13.8, phi, theta);
        heroScene.add(beacon);
    }

    animateHeroOrb();
}

function animateHeroOrb() {
    requestAnimationFrame(animateHeroOrb);
    if (heroControls) heroControls.update();
    if (heroTerrainOrb) heroTerrainOrb.rotation.y += 0.002;
    if (heroWireframe) heroWireframe.rotation.y += 0.002;
    heroRenderer.render(heroScene, heroCamera);
}
