
/* ==========================================================================
   🛰️ INTERACTIVE 3D SATELLITE ORBITAL EARTH GLOBE (THREE.JS)
   - Procedural 3D Earth Globe with Atmospheric Fresnel Glow
   - Live Orbital Path Ellipses & Pulsing Sensor Ground Cones
   - NASA GPM, Sentinel-1A SAR, INSAT-3DR, SWOT Orbit Tracking
   - Orbit Timelapse Multiplier & Camera Target Locking
   ========================================================================== */

let satScene, satCamera, satRenderer, satControls;
let earthMesh, atmosphereMesh, cloudsMesh;
let satelliteMeshes = [];
let orbitalSpeedMultiplier = 1.0;
let lockedSatellite = null;
let showFootprints = true;

const SATELLITE_ORBITS = [
    { id: 'GPM', name: 'NASA GPM Core', alt: 407, incl: 65, color: 0x38bdf8, speed: 0.008, radius: 15.5, size: 0.6, sensor: 'Dual-Freq Radar (DPR)' },
    { id: 'S1A', name: 'Copernicus Sentinel-1A', alt: 693, incl: 98, color: 0xc084fc, speed: 0.006, radius: 17.2, size: 0.55, sensor: 'C-band SAR' },
    { id: 'INSAT', name: 'ISRO INSAT-3DR', alt: 35786, incl: 0, color: 0x34d399, speed: 0.001, radius: 24.0, size: 0.7, sensor: '19-Ch Sounder' },
    { id: 'SWOT', name: 'NASA/CNES SWOT', alt: 890, incl: 77, color: 0xfbbf24, speed: 0.005, radius: 18.5, size: 0.5, sensor: 'Ka-band KaRIn' },
    { id: 'S2B', name: 'Copernicus Sentinel-2B', alt: 786, incl: 98.6, color: 0x22d3ee, speed: 0.0055, radius: 17.8, size: 0.5, sensor: 'MSI Optical 10m' }
];

document.addEventListener('DOMContentLoaded', () => {
    initSatelliteGlobeScene();
});

function initSatelliteGlobeScene() {
    const container = document.getElementById('satellite3DGlobeContainer');
    if (!container) return;

    // 1. Scene & Camera
    satScene = new THREE.Scene();
    satScene.background = new THREE.Color(0x02040a);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    satCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    satCamera.position.set(28, 18, 38);

    // 2. WebGL Renderer
    satRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    satRenderer.setSize(width, height);
    satRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(satRenderer.domElement);

    // 3. Orbit Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
        satControls = new THREE.OrbitControls(satCamera, satRenderer.domElement);
        satControls.enableZoom = false; // Never block page scroll
        satControls.enableDamping = true;
        satControls.dampingFactor = 0.06;
        satControls.minDistance = 18;
        satControls.maxDistance = 90;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    satScene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(50, 20, 50);
    satScene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x0284c7, 2.0);
    blueRimLight.position.set(-50, -20, -50);
    satScene.add(blueRimLight);

    // 5. Build 3D Earth Globe
    buildEarthGlobe();

    // 6. Build Satellite Orbits & Meshes
    buildSatelliteConstellations();

    // 7. Background Star Particles
    buildGlobeStarfield();

    window.addEventListener('resize', onGlobeResize);
    animateGlobe();
}

function buildEarthGlobe() {
    const earthRadius = 10;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // High-contrast deep space Earth material
    const earthMat = new THREE.MeshStandardMaterial({
        color: 0x0f2b48,
        roughness: 0.7,
        metalness: 0.2,
        emissive: 0x02162e,
        emissiveIntensity: 0.4
    });

    earthMesh = new THREE.Mesh(earthGeo, earthMat);
    satScene.add(earthMesh);

    // Glowing Atmosphere Shell
    const atmoGeo = new THREE.SphereGeometry(earthRadius * 1.04, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
    });
    atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
    satScene.add(atmosphereMesh);

    // Lat/Lon Coordinate Wireframe Grid
    const gridGeo = new THREE.SphereGeometry(earthRadius * 1.005, 24, 18);
    const gridMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    satScene.add(gridMesh);

    // Indian Subcontinent Marker Pin
    addHimalayanTargetBeacon(earthRadius);
}

function addHimalayanTargetBeacon(r) {
    // Lat: 30N, Lon: 79E roughly maps to spherical coordinates
    const phi = (90 - 30.7) * (Math.PI / 180);
    const theta = (79.0 + 180) * (Math.PI / 180);

    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    const pinGeo = new THREE.ConeGeometry(0.3, 1.2, 8);
    pinGeo.rotateX(-Math.PI / 2);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(x, y, z);
    pin.lookAt(0, 0, 0);
    satScene.add(pin);

    // Pulsing Radar Target Ring
    const ringGeo = new THREE.RingGeometry(0.4, 0.8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x * 1.02, y * 1.02, z * 1.02);
    ring.lookAt(0, 0, 0);
    satScene.add(ring);
}

function buildSatelliteConstellations() {
    satelliteMeshes = [];

    SATELLITE_ORBITS.forEach(sat => {
        // 1. Draw 3D Orbital Spline Path
        const orbitCurve = new THREE.EllipseCurve(
            0, 0,
            sat.radius, sat.radius * 0.95,
            0, 2 * Math.PI,
            false, 0
        );
        const points = orbitCurve.getPoints(100);
        const pathGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
        
        // Inclination Rotation
        pathGeo.rotateX((sat.incl * Math.PI) / 180);
        pathGeo.rotateZ((sat.incl * 0.3 * Math.PI) / 180);

        const pathMat = new THREE.LineBasicMaterial({
            color: sat.color,
            transparent: true,
            opacity: 0.4
        });
        const orbitLine = new THREE.Line(pathGeo, pathMat);
        satScene.add(orbitLine);

        // 2. Satellite Group (Body + Solar Panels + Sensor Cone)
        const satGroup = new THREE.Group();

        // Fuselage
        const bodyGeo = new THREE.BoxGeometry(sat.size, sat.size * 0.6, sat.size * 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        satGroup.add(body);

        // Solar Wings
        const wingGeo = new THREE.BoxGeometry(sat.size * 2.5, 0.05, sat.size * 0.8);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
        const wing = new THREE.Mesh(wingGeo, wingMat);
        satGroup.add(wing);

        // Sensor Swath Scanning Cone
        const coneGeo = new THREE.ConeGeometry(sat.radius * 0.25, sat.radius * 0.8, 16, 1, true);
        coneGeo.rotateX(Math.PI);
        const coneMat = new THREE.MeshBasicMaterial({
            color: sat.color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const scanCone = new THREE.Mesh(coneGeo, coneMat);
        scanCone.position.y = -sat.radius * 0.4;
        satGroup.add(scanCone);

        satGroup.userData = {
            config: sat,
            angle: Math.random() * Math.PI * 2,
            scanCone: scanCone
        };

        satScene.add(satGroup);
        satelliteMeshes.push(satGroup);
    });
}

function buildGlobeStarfield() {
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 300;
        starPos[i + 1] = (Math.random() - 0.5) * 300;
        starPos[i + 2] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 1.5,
        transparent: true,
        opacity: 0.6
    });
    const stars = new THREE.Points(starGeo, starMat);
    satScene.add(stars);
}

function animateGlobe() {
    requestAnimationFrame(animateGlobe);

    // 1. Slow Earth Rotation
    if (earthMesh) earthMesh.rotation.y += 0.001;

    // 2. Update Satellites along their 3D Orbits
    satelliteMeshes.forEach(satGroup => {
        const conf = satGroup.userData.config;
        satGroup.userData.angle += conf.speed * orbitalSpeedMultiplier;
        const a = satGroup.userData.angle;

        // Elliptical coordinate calculation
        const x = Math.cos(a) * conf.radius;
        const z = Math.sin(a) * (conf.radius * 0.95);
        const vec = new THREE.Vector3(x, 0, z);

        // Apply orbit inclination
        vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), (conf.incl * Math.PI) / 180);
        vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), (conf.incl * 0.3 * Math.PI) / 180);

        satGroup.position.copy(vec);
        satGroup.lookAt(0, 0, 0); // Always point sensor down to Earth core

        // Footprint visibility
        if (satGroup.userData.scanCone) {
            satGroup.userData.scanCone.visible = showFootprints;
        }
    });

    // 3. Camera Target Lock
    if (lockedSatellite) {
        const satPos = lockedSatellite.position;
        const camOffset = satPos.clone().normalize().multiplyScalar(12);
        satCamera.position.lerp(satPos.clone().add(camOffset), 0.08);
        satControls.target.lerp(satPos, 0.08);
    }

    if (satControls) satControls.update();
    satRenderer.render(satScene, satCamera);
}

function onGlobeResize() {
    const container = document.getElementById('satellite3DGlobeContainer');
    if (!container || !satCamera || !satRenderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    satCamera.aspect = width / height;
    satCamera.updateProjectionMatrix();
    satRenderer.setSize(width, height);
}

// UI Controller Functions
function setOrbitTimelapse(val) {
    orbitalSpeedMultiplier = parseFloat(val);
    document.querySelectorAll('.speed-pill-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function toggleFootprints() {
    showFootprints = !showFootprints;
    const btn = document.getElementById('btnToggleFootprints');
    if (btn) {
        btn.innerText = showFootprints ? '📡 Swath Cones: ON' : '📡 Swath Cones: OFF';
        btn.classList.toggle('active', showFootprints);
    }
}

function lockCameraToSatellite(satId) {
    if (satId === 'ALL') {
        lockedSatellite = null;
        if (satControls) {
            satCamera.position.set(28, 18, 38);
            satControls.target.set(0, 0, 0);
        }
        updateSelectedSatBadge('GLOBAL RESCUE CONSTELLATION');
        return;
    }

    const sat = satelliteMeshes.find(s => s.userData.config.id === satId);
    if (sat) {
        lockedSatellite = sat;
        updateSelectedSatBadge(sat.userData.config.name);
    }
}

function updateSelectedSatBadge(name) {
    const badge = document.getElementById('selectedSatNameDisplay');
    if (badge) badge.innerText = name;
}
