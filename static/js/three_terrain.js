/* ==========================================================================
   HYDROSENTINEL AI™ - 3D DIGITAL TWIN ENGINE (SAPFORCE AI SAAS INSPIRED)
   - Realistic Topographic DEM with Inundation Water Plane
   - LiDAR Laser Mesh, Infrared Thermal Heatmap, Cyber Matrix Wireframe
   - 3D Station Beacons with Floating Radar HUD
   - Drone Flyover Autopilot
   ========================================================================== */

let scene, camera, renderer, controls;
let terrainMesh, wireMesh, waterMesh, rainParticles, rainGeometry, lightningLight;
let stationMarkers = [];
let isDroneFlying = false;
let currentFloodHeight = 1.2;
let targetFloodHeight = 1.2;
let manualFloodOverride = null;
let rainSpeed = 0.8;
let current3DMode = 'realistic';
let currentAtmosphere = 'cloudburst';
let radarSweepLine = null;
let radarSweepAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
    init3DScene();
});

function init3DScene() {
    const container = document.getElementById('threeDViewportContainer') || document.getElementById('topographical3DMap');
    if (!container) return;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040714);
    scene.fog = new THREE.FogExp2(0x040714, 0.008);

    const width = container.clientWidth || 760;
    const height = container.clientHeight || 530;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 42, 62);

    // 2. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls with Smart Hover Zoom
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false; // Muted by default to avoid page scroll hijack
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.minDistance = 12;
        controls.maxDistance = 150;
        controls.target.set(0, 4, 0);

        // Smart Zoom: enable mouse wheel zoom ONLY while hovering over the 3D canvas
        container.addEventListener('mouseenter', () => {
            if (controls) controls.enableZoom = true;
        });
        container.addEventListener('mouseleave', () => {
            if (controls) controls.enableZoom = false;
        });
    }

    // 4. Lighting Rig (Sapforce AI Glow)
    setupLighting();

    // 5. Build 3D Mountain Valley Terrain
    buildMountainTerrain();

    // 6. Build Inundation Water Plane
    buildFloodWater();

    // 7. Build Weather Particle System
    buildRainWeatherSystem();

    // 8. Build 3D Station Beacons
    buildStationBeacons();

    // 9. Build Doppler Radar Sweep
    createDopplerRadarSweep(scene);
    buildHydrodynamicStreamlines();

    // Add 3D Grid back (Cybernetic Wireframe Grid)
    const gridHelper = new THREE.GridHelper(100, 50, 0x00f0ff, 0x005577);
    gridHelper.position.y = -4.4; // Just below the lowest valley point
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);


    window.addEventListener('resize', onWindowResize);
    animate();

    // Expose 3D Objects to Global Window Scope
    window.scene = scene;
    window.camera = camera;
    window.controls = controls;
    window.currentCamera = camera;
    window.currentControls = controls;
    window.renderer = renderer;
}

// ============================================================================
// ✨ LOVABLE 3D CAMERA INTERPOLATION PRESETS
// ============================================================================
let camTweenRaf = null;

window.setLovable3DCameraPreset = function(preset) {
    if (!camera || !controls) {
        console.warn('3D Camera or Controls not ready yet');
        return;
    }

    let targetPos = new THREE.Vector3(0, 42, 62);
    let targetLook = new THREE.Vector3(0, 4, 0);

    switch (preset) {
        case 'orbit':
            targetPos.set(0, 42, 62);
            targetLook.set(0, 4, 0);
            break;
        case 'satellite': // Nadir top-down perpendicular satellite swath
            targetPos.set(0, 95, 0.1);
            targetLook.set(0, 0, 0);
            break;
        case 'isometric': // 45-degree architectural / topographic axonometric
            targetPos.set(45, 38, 45);
            targetLook.set(0, 2, 0);
            break;
        case 'gorge': // River canyon cross-section view
            targetPos.set(-30, 10, 15);
            targetLook.set(0, 5, -10);
            break;
    }

    if (camTweenRaf) cancelAnimationFrame(camTweenRaf);

    const startPos = camera.position.clone();
    const startLook = controls.target.clone();
    const startTime = performance.now();
    const durationMs = 650;

    function animateCamera(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1.0);
        // Cubic ease-out: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        controls.update();

        if (progress < 1.0) {
            camTweenRaf = requestAnimationFrame(animateCamera);
        } else {
            camera.position.copy(targetPos);
            controls.target.copy(targetLook);
            controls.update();
            camTweenRaf = null;
        }
    }

    camTweenRaf = requestAnimationFrame(animateCamera);

    // Update UI active buttons
    document.querySelectorAll('.btn-cam-preset').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === preset) btn.classList.add('active');
    });
};

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    sunLight.position.set(35, 65, 45);
    sunLight.castShadow = true;
    sunLight.name = 'sunLight';
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 2.0);
    rimLight.position.set(-45, 35, -35);
    rimLight.name = 'rimLight';
    scene.add(rimLight);

    lightningLight = new THREE.PointLight(0xffffff, 0, 160);
    lightningLight.position.set(0, 50, 0);
    scene.add(lightningLight);
}

function buildMountainTerrain() {
    const segments = 96;
    const geometry = new THREE.PlaneGeometry(85, 85, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        const distCenter = Math.sqrt(x * x + z * z);
        const mountainRidge = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 14 + Math.sin(x * 0.25) * 4.5;
        const valleyGorge = -Math.exp(-(x * x) / 50) * 12;
        const peaks = Math.exp(-((distCenter - 30) * (distCenter - 30)) / 130) * 19;

        let y = mountainRidge + valleyGorge + peaks;
        y = Math.max(-4.5, y);
        pos.setY(i, y);

        // Sapforce High-Contrast Inundation Relief Gradient
        if (y < 0.5) {
            color.setRGB(0.95, 0.15, 0.35); // Crimson Gorge Hazard
        } else if (y < 4.0) {
            color.setRGB(0.98, 0.65, 0.05); // Amber Slope
        } else if (y < 12.0) {
            color.setRGB(0.05, 0.75, 0.55); // Emerald Forest
        } else {
            color.setRGB(0.20, 0.35, 0.65); // High Slate Ridge
        }
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.75,
        metalness: 0.15,
        flatShading: true
    });

    terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // Overlay Wireframe
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });
    wireMesh = new THREE.Mesh(geometry, wireMat);
    wireMesh.position.y = 0.05;
    scene.add(wireMesh);
}

function buildFloodWater() {
    const waterGeo = new THREE.PlaneGeometry(85, 85, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.68,
        roughness: 0.1,
        metalness: 0.85
    });

    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 1.2;
    scene.add(waterMesh);
}

function buildRainWeatherSystem() {
    const particleCount = 1800;
    rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i + 1] = Math.random() * 60 + 5;
        positions[i + 2] = (Math.random() - 0.5) * 80;
        velocities[i / 3] = Math.random() * 0.8 + 0.4;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const rainMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.85,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
    });

    rainParticles = new THREE.Points(rainGeometry, rainMat);
    scene.add(rainParticles);
}

function buildStationBeacons() {
    const beaconGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8
    });

    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 5, 0);
    scene.add(beacon);
    stationMarkers.push(beacon);

    // Glowing Pulse Ring
    const ringGeo = new THREE.RingGeometry(1.5, 2.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 5.2, 0);
    scene.add(ring);
    stationMarkers.push(ring);
}

function createDopplerRadarSweep(scene) {
    const radarGeo = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 10, 0, 42, 10, 0]);
    radarGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const radarMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.75,
        linewidth: 3
    });
    
    radarSweepLine = new THREE.Line(radarGeo, radarMat);
    scene.add(radarSweepLine);
}

function onWindowResize() {
    const container = document.getElementById('threeDViewportContainer') || document.getElementById('topographical3DMap');
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 530;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function set3DRenderMode(mode) {
    current3DMode = mode;
    document.querySelectorAll('.btn-3d-mode').forEach(b => b.classList.remove('active'));
    event?.target?.classList.add('active');

    if (!terrainMesh) return;

    if (mode === 'realistic') {
        terrainMesh.visible = true;
        wireMesh.visible = true;
        wireMesh.material.opacity = 0.15;
    } else if (mode === 'lidar') {
        terrainMesh.visible = false;
        wireMesh.visible = true;
        wireMesh.material.opacity = 0.8;
    } else if (mode === 'wireframe') {
        terrainMesh.visible = false;
        wireMesh.visible = true;
        wireMesh.material.opacity = 0.5;
    } else if (mode === 'thermal') {
        terrainMesh.visible = true;
        wireMesh.visible = false;
    }
}

function set3DAtmosphere(atmo) {
    currentAtmosphere = atmo;
    document.querySelectorAll('.btn-3d-atmo').forEach(b => b.classList.remove('active'));
    event?.target?.classList.add('active');

    if (!rainParticles) return;
    if (atmo === 'cloudburst') {
        rainParticles.visible = true;
        rainSpeed = 1.4;
    } else if (atmo === 'overcast') {
        rainParticles.visible = true;
        rainSpeed = 0.5;
    } else {
        rainParticles.visible = false;
    }
}

function toggleDroneFlyover() {
    isDroneFlying = !isDroneFlying;
    event?.target?.classList.toggle('active');
}

function onFloodSliderChange(val) {
    manualFloodOverride = parseFloat(val);
    const label = document.getElementById('floodHeightVal');
    if (label) label.textContent = `${manualFloodOverride.toFixed(1)} m`;
    if (waterMesh) {
        waterMesh.position.y = manualFloodOverride;
    }
}

let droneAngle = 0;
function animate() {
    updateEvacuationSim();
    updateHydrodynamicStreamlines();
    if (typeof updateDroneFlightPhysics === 'function') updateDroneFlightPhysics();
    requestAnimationFrame(animate);

    if (controls) controls.update();

    // Drone Autopilot
    if (isDroneFlying) {
        droneAngle += 0.008;
        camera.position.x = Math.sin(droneAngle) * 55;
        camera.position.z = Math.cos(droneAngle) * 55;
        camera.position.y = 35 + Math.sin(droneAngle * 2) * 8;
        camera.lookAt(0, 4, 0);
    }

    // Radar Beam Sweep
    if (radarSweepLine) {
        radarSweepAngle += 0.035;
        radarSweepLine.rotation.y = radarSweepAngle;
    }

    // Rain Particle Animation
    if (rainParticles && rainParticles.visible) {
        const pos = rainGeometry.attributes.position.array;
        const vel = rainGeometry.attributes.velocity.array;

        for (let i = 1; i < pos.length; i += 3) {
            pos[i] -= vel[Math.floor(i / 3)] * rainSpeed * 2.2;
            if (pos[i] < -4) {
                pos[i] = 60;
            }
        }
        rainGeometry.attributes.position.needsUpdate = true;
    }

    // Water Surface Sinusoidal Ripple
    if (waterMesh) {
        const time = Date.now() * 0.003;
        waterMesh.position.y = (manualFloodOverride !== null ? manualFloodOverride : 1.2) + Math.sin(time) * 0.12;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}


function flyToStationCoordinates(stnId) {
    const coords = {
        'STN-KL-01': { x: -15, y: 38, z: 45 },
        'STN-AL-02': { x: 0, y: 42, z: 55 },
        'STN-TS-03': { x: 18, y: 35, z: 40 },
        'STN-WG-04': { x: -22, y: 32, z: 38 },
        'STN-KD-05': { x: 5, y: 46, z: 58 },
        'STN-CH-06': { x: -8, y: 40, z: 50 },
        'STN-WY-07': { x: -18, y: 34, z: 42 },
        'STN-DZ-08': { x: 20, y: 36, z: 46 }
    };

    const target = coords[stnId] || { x: 0, y: 42, z: 62 };
    if (camera) {
        camera.position.set(target.x, target.y, target.z);
        if (controls) controls.target.set(0, 4, 0);
    }
}


function on3DWaterSurgeChange(val) {
    const heightOffset = parseFloat(val);
    const textEl = document.getElementById('floodSurgeValText');
    if (textEl) {
        textEl.innerText = `${heightOffset >= 0 ? '+' : ''}${heightOffset.toFixed(1)}m ${heightOffset > 10 ? '🚨 [EXTREME INUNDATION]' : heightOffset > 4 ? '⚠️ [SURGE ACTIVE]' : '[NORMAL FLOW]'}`;
        textEl.style.color = heightOffset > 10 ? '#ef4444' : heightOffset > 4 ? '#f59e0b' : '#05ffa1';
    }

    if (waterPlane) {
        waterPlane.position.y = 2.5 + heightOffset * 0.8;
        if (heightOffset > 10 && waterPlane.material) {
            waterPlane.material.color.setHex(0xb91c1c); // Turbid crimson flood
        } else if (heightOffset > 4 && waterPlane.material) {
            waterPlane.material.color.setHex(0xd97706); // Sediment amber
        } else if (waterPlane.material) {
            waterPlane.material.color.setHex(0x0088cc); // Natural alpine stream
        }
    }
}


function on3DSolarOrbitChange(hour) {
    const h = parseInt(hour, 10);
    const textEl = document.getElementById('solarOrbitValText');
    const isNight = h < 6 || h > 19;
    const isSunset = (h >= 17 && h <= 19) || (h >= 5 && h <= 7);

    if (textEl) {
        textEl.innerText = `${h.toString().padStart(2, '0')}:00 ${isNight ? '🌙 (Midnight Radar)' : isSunset ? '🌇 (Twilight Shadow)' : '☀️ (Alpine Sunlight)'}`;
        textEl.style.color = isNight ? '#38bdf8' : isSunset ? '#f97316' : '#f59e0b';
    }

    if (directionalLight) {
        const angle = (h / 24) * Math.PI * 2;
        directionalLight.position.x = Math.cos(angle) * 120;
        directionalLight.position.y = Math.sin(angle) * 120;
        directionalLight.intensity = isNight ? 0.35 : isSunset ? 0.85 : 1.4;
        directionalLight.color.setHex(isNight ? 0x38bdf8 : isSunset ? 0xf97316 : 0xffffff);
    }
}


let lidarPointsMesh = null;

function toggleLidarPointCloud() {
    if (!terrainMesh || !scene) return;

    if (!lidarPointsMesh) {
        const geo = terrainMesh.geometry.clone();
        const count = geo.attributes.position.count;
        const colors = new Float32Array(count * 3);
        const pos = geo.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const y = pos[i * 3 + 1];
            if (y > 10) {
                colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.25; colors[i * 3 + 2] = 0.25; // Red peak
            } else if (y > 4) {
                colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.65; colors[i * 3 + 2] = 0.15; // Amber ridge
            } else {
                colors[i * 3] = 0.05; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.55; // Emerald valley
            }
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const pMat = new THREE.PointsMaterial({
            size: 1.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });

        lidarPointsMesh = new THREE.Points(geo, pMat);
        lidarPointsMesh.position.copy(terrainMesh.position);
        lidarPointsMesh.rotation.copy(terrainMesh.rotation);
        scene.add(lidarPointsMesh);
    }

    const isShowingPoints = lidarPointsMesh.visible;
    lidarPointsMesh.visible = !isShowingPoints;
    terrainMesh.visible = isShowingPoints;

    const btn = document.getElementById('lidarModeBtn');
    if (btn) {
        btn.classList.toggle('active', !isShowingPoints);
        btn.innerHTML = !isShowingPoints ? 'Solid DEM' : 'LiDAR Cloud';
    }
}


let activeDroneMode = 'orbital';
let droneTime = 0;

function setDroneCameraMode(mode) {
    activeDroneMode = mode;
    document.querySelectorAll('.btn-drone-mode').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`droneMode_${mode}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (mode === 'tactical' && camera) {
        camera.position.set(0, 95, 0.1);
        if (controls) controls.target.set(0, 0, 0);
    } else if (mode === 'valley' && camera) {
        camera.position.set(0, 8, 35);
        if (controls) controls.target.set(0, 6, -20);
    } else if (mode === 'orbital' && camera) {
        camera.position.set(0, 42, 65);
        if (controls) controls.target.set(0, 4, 0);
    }
}


// ============================================================================
// 🚁 MULTI-AGENT EVACUATION SIMULATOR (BOIDS / GRADIENT ASCENT)
// ============================================================================
let agents = [];
let agentMeshInstanced;
const AGENT_COUNT = 400;
let isEvacSimRunning = false;

function initEvacuationSim() {
    if (agentMeshInstanced) return; // Already init

    const agentGeo = new THREE.ConeGeometry(0.2, 0.6, 4);
    agentGeo.rotateX(Math.PI / 2); // Point forward along Z
    
    const agentMat = new THREE.MeshStandardMaterial({
        color: 0x05ffa1, 
        emissive: 0x05ffa1,
        emissiveIntensity: 0.8,
        roughness: 0.2
    });

    agentMeshInstanced = new THREE.InstancedMesh(agentGeo, agentMat, AGENT_COUNT);
    agentMeshInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    // Store custom colors for instances
    const colorArray = new Float32Array(AGENT_COUNT * 3);
    
    for (let i = 0; i < AGENT_COUNT; i++) {
        // Spawn randomly across the map
        const startX = (Math.random() - 0.5) * 60;
        const startZ = (Math.random() - 0.5) * 60;
        const startY = getTerrainHeightAt(startX, startZ);
        
        agents.push({
            position: new THREE.Vector3(startX, startY, startZ),
            velocity: new THREE.Vector3((Math.random()-0.5)*0.1, 0, (Math.random()-0.5)*0.1),
            status: 'SAFE', // SAFE, EVAC, STRANDED
            speed: 0.15 + Math.random() * 0.1
        });
        
        colorArray[i * 3 + 0] = 0.019; // R
        colorArray[i * 3 + 1] = 1.0;   // G
        colorArray[i * 3 + 2] = 0.631; // B
    }
    
    agentMeshInstanced.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
    agentMeshInstanced.material.vertexColors = true;
    
    scene.add(agentMeshInstanced);
    isEvacSimRunning = true;
    console.log("Multi-Agent Evacuation Simulation Initialized.");
}

// Helper to get rough terrain height given x, z
function getTerrainHeightAt(x, z) {
    const distCenter = Math.sqrt(x * x + z * z);
    const mountainRidge = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 14 + Math.sin(x * 0.25) * 4.5;
    const valleyGorge = -Math.exp(-(x * x) / 50) * 12;
    const peaks = Math.exp(-((distCenter - 30) * (distCenter - 30)) / 130) * 19;
    let y = mountainRidge + valleyGorge + peaks;
    return Math.max(-4.5, y);
}

function updateEvacuationSim() {
    if (!isEvacSimRunning || !agentMeshInstanced) return;
    
    const dummy = new THREE.Object3D();
    const colorSafe = new THREE.Color(0x05ffa1);   // Green
    const colorEvac = new THREE.Color(0xf59e0b);   // Amber
    const colorStranded = new THREE.Color(0xff003c); // Red

    const waterY = waterMesh ? waterMesh.position.y : -2;

    for (let i = 0; i < AGENT_COUNT; i++) {
        let agent = agents[i];
        let p = agent.position;
        let v = agent.velocity;

        // Current height
        const currentY = getTerrainHeightAt(p.x, p.z);
        p.y = currentY;

        // State Machine
        let cColor = colorSafe;
        if (currentY < waterY + 0.2) {
            agent.status = 'STRANDED';
            cColor = colorStranded;
            v.multiplyScalar(0.1); // Barely moving, struggling in water
        } else if (currentY < waterY + 4.0) {
            agent.status = 'EVAC';
            cColor = colorEvac;
            
            // Gradient Ascent (Seek higher ground)
            const dx = 1.0;
            const dz = 1.0;
            const hx = getTerrainHeightAt(p.x + dx, p.z);
            const hz = getTerrainHeightAt(p.x, p.z + dz);
            
            const gradX = hx - currentY;
            const gradZ = hz - currentY;
            
            // Steer uphill, away from water
            const uphill = new THREE.Vector3(gradX, 0, gradZ).normalize().multiplyScalar(agent.speed * 1.5);
            v.lerp(uphill, 0.1);
        } else {
            agent.status = 'SAFE';
            cColor = colorSafe;
            // Wander slowly
            if (Math.random() < 0.05) {
                const wander = new THREE.Vector3((Math.random()-0.5), 0, (Math.random()-0.5)).normalize().multiplyScalar(agent.speed * 0.3);
                v.lerp(wander, 0.2);
            }
        }

        // Apply velocity
        p.add(v);

        // Bounds checking
        if (p.x < -40 || p.x > 40) v.x *= -1;
        if (p.z < -40 || p.z > 40) v.z *= -1;

        // Update Matrix
        dummy.position.copy(p);
        
        // Orient agent to velocity
        if (v.lengthSq() > 0.001) {
            const targetPos = p.clone().add(v);
            dummy.lookAt(targetPos);
        }
        
        dummy.updateMatrix();
        agentMeshInstanced.setMatrixAt(i, dummy.matrix);
        agentMeshInstanced.setColorAt(i, cColor);
    }
    
    agentMeshInstanced.instanceMatrix.needsUpdate = true;
    if (agentMeshInstanced.instanceColor) agentMeshInstanced.instanceColor.needsUpdate = true;
}


// Tactile Knob Callback for Rain
function setRainIntensity(val) {
    // val is 0 to 100
    if (!rainParticles) return;
    
    if (val === 0) {
        rainParticles.visible = false;
        rainSpeed = 0;
        return;
    }
    
    rainParticles.visible = true;
    rainSpeed = 0.2 + (val / 100) * 2.0; // scales from 0.2 to 2.2
    
    // Adjust opacity based on intensity
    if (rainParticles.material) {
        rainParticles.material.opacity = 0.2 + (val / 100) * 0.6;
    }
    
    // Auto-switch atmosphere if it gets intense
    if (val > 80 && currentAtmosphere !== 'cloudburst') {
        currentAtmosphere = 'cloudburst';
        if (scene.fog) scene.fog.density = 0.02;
    } else if (val <= 80 && currentAtmosphere !== 'clear') {
        currentAtmosphere = 'clear';
        if (scene.fog) scene.fog.density = 0.008;
    }
}


/* ==========================================================================
   🌊 WINDY-STYLE REAL-TIME HYDRODYNAMIC STREAMLINES (GPU VECTOR FIELD)
   - 3,000 Fluid Particles following Terrain Gradient Ascent/Descent
   - Dynamic Kinetic Flow Velocity & Bottleneck Canyon Acceleration
   ========================================================================== */

let streamlinePoints = null;
let streamlineGeo = null;
let showStreamlines = true;
let streamlineSpeedMultiplier = 1.0;
const STREAMLINE_COUNT = 3000;
let streamlinePositions = null;
let streamlineColors = null;
let streamlineLifetimes = null;

function buildHydrodynamicStreamlines() {
    streamlineGeo = new THREE.BufferGeometry();
    streamlinePositions = new Float32Array(STREAMLINE_COUNT * 3);
    streamlineColors = new Float32Array(STREAMLINE_COUNT * 3);
    streamlineLifetimes = new Float32Array(STREAMLINE_COUNT);

    for (let i = 0; i < STREAMLINE_COUNT; i++) {
        resetStreamlineParticle(i, true);
    }

    streamlineGeo.setAttribute('position', new THREE.BufferAttribute(streamlinePositions, 3));
    streamlineGeo.setAttribute('color', new THREE.BufferAttribute(streamlineColors, 3));

    const streamMat = new THREE.PointsMaterial({
        size: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    streamlinePoints = new THREE.Points(streamlineGeo, streamMat);
    streamlinePoints.name = 'streamlineParticles';
    scene.add(streamlinePoints);
}

function resetStreamlineParticle(i, initial = false) {
    const idx = i * 3;
    // Spawn mostly on slopes and ridges
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 28;
    streamlinePositions[idx] = Math.cos(angle) * dist;
    streamlinePositions[idx + 2] = Math.sin(angle) * dist;

    // Sample terrain elevation approx
    const x = streamlinePositions[idx];
    const z = streamlinePositions[idx + 2];
    const y = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 14 + Math.sin(x * 0.25) * 4.5 - Math.exp(-(x * x) / 50) * 12;
    streamlinePositions[idx + 1] = Math.max(-3.8, y) + 0.4;

    streamlineLifetimes[i] = initial ? Math.random() * 120 : 120 + Math.random() * 60;

    // Cyan base color
    streamlineColors[idx] = 0.22;     // R
    streamlineColors[idx + 1] = 0.74; // G
    streamlineColors[idx + 2] = 0.97; // B
}

function updateHydrodynamicStreamlines() {
    if (!streamlinePoints || !showStreamlines) return;

    const pos = streamlineGeo.attributes.position.array;
    const col = streamlineGeo.attributes.color.array;

    for (let i = 0; i < STREAMLINE_COUNT; i++) {
        const idx = i * 3;
        streamlineLifetimes[i] -= 1 * streamlineSpeedMultiplier;

        if (streamlineLifetimes[i] <= 0) {
            resetStreamlineParticle(i);
            continue;
        }

        const x = pos[idx];
        const z = pos[idx + 2];

        // Gradient vector towards river gorge center (x = 0) and downstream (+z)
        const gorgePullX = -x * 0.04;
        const downriverZ = (Math.abs(x) < 8 ? 0.35 : 0.12) * streamlineSpeedMultiplier;
        const meanderX = Math.sin(z * 0.15) * 0.08;

        pos[idx] += (gorgePullX + meanderX);
        pos[idx + 2] += downriverZ;

        // Sample terrain height
        const curX = pos[idx];
        const curZ = pos[idx + 2];
        const y = Math.sin(curX * 0.12) * Math.cos(curZ * 0.12) * 14 + Math.sin(curX * 0.25) * 4.5 - Math.exp(-(curX * curX) / 50) * 12;
        pos[idx + 1] = Math.max(waterMesh ? waterMesh.position.y + 0.2 : -3.8, y + 0.35);

        // Velocity color transition (Amber/Rose when fast surge in gorge)
        const inGorge = Math.abs(curX) < 8;
        if (inGorge && streamlineSpeedMultiplier > 1.2) {
            col[idx] = 0.98;     // R (Amber/Rose)
            col[idx + 1] = 0.55; // G
            col[idx + 2] = 0.15; // B
        } else if (inGorge) {
            col[idx] = 0.20;     // Emerald
            col[idx + 1] = 0.85;
            col[idx + 2] = 0.60;
        } else {
            col[idx] = 0.22;     // Cyan
            col[idx + 1] = 0.74;
            col[idx + 2] = 0.97;
        }

        // Boundary wrap
        if (Math.abs(pos[idx]) > 42 || Math.abs(pos[idx + 2]) > 42) {
            resetStreamlineParticle(i);
        }
    }

    streamlineGeo.attributes.position.needsUpdate = true;
    streamlineGeo.attributes.color.needsUpdate = true;
}

function toggleStreamlines() {
    showStreamlines = !showStreamlines;
    if (streamlinePoints) streamlinePoints.visible = showStreamlines;
    const btn = document.getElementById('btnToggleStreamlines');
    if (btn) {
        btn.innerText = showStreamlines ? '🌊 Streamlines: ON' : '🌊 Streamlines: OFF';
        btn.classList.toggle('active', showStreamlines);
    }
}

function setStreamlineVelocity(val) {
    streamlineSpeedMultiplier = parseFloat(val);
}
