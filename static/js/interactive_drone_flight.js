
/* ==========================================================================
   🎮 INTERACTIVE 3D DRONE FLIGHT SIMULATOR (HYDROSENTINEL AI)
   - WASD / Arrow Keys 6-DOF Flight Physics
   - Dynamic Quadcopter 3D Model with Spinning Rotors & Spotlights
   - First-Person (FPV) & Third-Person Chase Cameras
   - Terrain Proximity Radar & Hazard Classification Lock
   ========================================================================== */

let droneObject = null;
let dronePropellers = [];
let droneSpotlight = null;
let isFlightModeActive = false;
let cameraFlightMode = 'chase'; // 'chase' or 'fpv'

// Flight Dynamics
const flightState = {
    pos: new THREE.Vector3(0, 18, 25),
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),
    speed: 0,
    maxSpeed: 0.85,
    accel: 0.04,
    drag: 0.94,
    yaw: 0,
    pitch: 0,
    roll: 0,
    altitude: 18,
    throttle: 50
};

const keysPressed = {};

function initDroneFlightSystem() {
    if (droneObject || typeof scene === 'undefined') return;

    // Build Detailed 3D Quadcopter Mesh
    droneObject = new THREE.Group();

    // 1. Central Carbon Fuselage
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    droneObject.add(bodyMesh);

    // 2. Dome Canopy
    const canopyGeo = new THREE.SphereGeometry(0.6, 16, 8);
    canopyGeo.scale(1, 0.5, 1.5);
    const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.9
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.25, -0.1);
    droneObject.add(canopyMesh);

    // 3. 4 Rotor Arms & Motor Pods
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });

    // Diagonal Arm 1
    const arm1 = new THREE.Mesh(armGeo, armMat);
    arm1.rotation.z = Math.PI / 2;
    arm1.rotation.y = Math.PI / 4;
    droneObject.add(arm1);

    // Diagonal Arm 2
    const arm2 = new THREE.Mesh(armGeo, armMat);
    arm2.rotation.z = Math.PI / 2;
    arm2.rotation.y = -Math.PI / 4;
    droneObject.add(arm2);

    // 4. Rotor Blades
    const motorOffsets = [
        { x: -1.0, z: -1.0 },
        { x: 1.0, z: -1.0 },
        { x: -1.0, z: 1.0 },
        { x: 1.0, z: 1.0 }
    ];

    dronePropellers = [];
    motorOffsets.forEach((m, idx) => {
        // Motor Pod
        const podGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 12);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(m.x, 0.1, m.z);
        droneObject.add(pod);

        // Blade
        const propGeo = new THREE.BoxGeometry(1.3, 0.02, 0.14);
        const propMat = new THREE.MeshBasicMaterial({ color: idx < 2 ? 0x38bdf8 : 0x05ffa1, transparent: true, opacity: 0.75 });
        const prop = new THREE.Mesh(propGeo, propMat);
        prop.position.set(m.x, 0.3, m.z);
        droneObject.add(prop);
        dronePropellers.push(prop);
    });

    // 5. Forward Scanning Spotlight
    droneSpotlight = new THREE.SpotLight(0x00f0ff, 4, 45, Math.PI / 6, 0.4);
    droneSpotlight.position.set(0, 0, -1);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -6, -20);
    droneObject.add(spotTarget);
    droneSpotlight.target = spotTarget;
    droneObject.add(droneSpotlight);

    // Initial position
    droneObject.position.copy(flightState.pos);
    droneObject.visible = false; // Hidden until pilot mode starts
    scene.add(droneObject);

    // Key listeners
    window.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true;
        if (e.code === 'KeyV' && isFlightModeActive) {
            cameraFlightMode = cameraFlightMode === 'chase' ? 'fpv' : 'chase';
            updateFlightHudCamBadge();
        }
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false;
    });

    console.log("Interactive 3D Drone Flight System Initialized.");
}

function toggleInteractiveDroneFlight() {
    if (!droneObject) initDroneFlightSystem();
    isFlightModeActive = !isFlightModeActive;

    const hud = document.getElementById('droneFlightHudOverlay');
    const startBtn = document.getElementById('btnToggleFlightMode');

    if (isFlightModeActive) {
        droneObject.visible = true;
        flightState.pos.set(0, 18, 25);
        flightState.vel.set(0, 0, 0);
        flightState.yaw = 0;
        if (controls) controls.enabled = false;
        if (hud) hud.style.display = 'block';
        if (startBtn) {
            startBtn.innerHTML = '🛑 Exit Drone Pilot Mode';
            startBtn.classList.add('flight-active-btn');
        }
    } else {
        droneObject.visible = false;
        if (controls) {
            controls.enabled = true;
            camera.position.set(0, 42, 62);
            controls.target.set(0, 4, 0);
        }
        if (hud) hud.style.display = 'none';
        if (startBtn) {
            startBtn.innerHTML = '🎮 Pilot 3D Inspection Drone';
            startBtn.classList.remove('flight-active-btn');
        }
    }
}

function updateDroneFlightPhysics() {
    if (!isFlightModeActive || !droneObject) return;

    // 1. Rotor Blade High RPM Spin
    dronePropellers.forEach((p, idx) => {
        p.rotation.y += (idx % 2 === 0 ? 0.55 : -0.55);
    });

    // 2. Keyboard Input Mapping
    const moveVector = new THREE.Vector3(0, 0, 0);

    // Forward / Backward (W / S or ArrowUp / ArrowDown)
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) moveVector.z -= 1;
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) moveVector.z += 1;

    // Yaw / Turn (A / D or ArrowLeft / ArrowRight)
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) flightState.yaw += 0.035;
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) flightState.yaw -= 0.035;

    // Altitude (Space = Ascend, ShiftLeft / KeyC = Descend)
    if (keysPressed['Space']) moveVector.y += 1;
    if (keysPressed['ShiftLeft'] || keysPressed['KeyC']) moveVector.y -= 1;

    // Apply Yaw Rotation to Movement Vector
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), flightState.yaw);

    // Acceleration
    if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(flightState.accel);
        flightState.vel.add(moveVector);
    }

    // Velocity Clamping & Drag
    flightState.vel.clampLength(0, flightState.maxSpeed);
    flightState.vel.multiplyScalar(flightState.drag);
    flightState.pos.add(flightState.vel);

    // 3. Terrain Height Clamping & Anti-Crash Safety
    const groundHeight = typeof getTerrainHeightAt === 'function' ? getTerrainHeightAt(flightState.pos.x, flightState.pos.z) : -4;
    const minSafeAltitude = groundHeight + 2.0;

    if (flightState.pos.y < minSafeAltitude) {
        flightState.pos.y = minSafeAltitude;
        flightState.vel.y = 0;
    }

    // Boundaries (-40 to +40)
    flightState.pos.x = Math.max(-38, Math.min(38, flightState.pos.x));
    flightState.pos.z = Math.max(-38, Math.min(38, flightState.pos.z));

    // 4. Drone Attitude (Pitch & Roll Banking)
    const localVelZ = (keysPressed['KeyW'] ? 0.35 : 0) - (keysPressed['KeyS'] ? 0.25 : 0);
    const localRoll = (keysPressed['KeyA'] ? 0.4 : 0) - (keysPressed['KeyD'] ? 0.4 : 0);

    flightState.pitch = THREE.MathUtils.lerp(flightState.pitch, -localVelZ, 0.1);
    flightState.roll = THREE.MathUtils.lerp(flightState.roll, localRoll, 0.1);

    // Apply Transform to Drone
    droneObject.position.copy(flightState.pos);
    droneObject.rotation.set(flightState.pitch, flightState.yaw, flightState.roll);

    // 5. Camera Control
    if (cameraFlightMode === 'chase') {
        // Third Person Chase Cam behind drone
        const chaseOffset = new THREE.Vector3(0, 4.5, 9.5);
        chaseOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), flightState.yaw);
        const targetCamPos = flightState.pos.clone().add(chaseOffset);
        
        camera.position.lerp(targetCamPos, 0.15);
        const lookTarget = flightState.pos.clone().add(new THREE.Vector3(0, 1.2, -4).applyAxisAngle(new THREE.Vector3(0, 1, 0), flightState.yaw));
        camera.lookAt(lookTarget);
    } else {
        // First Person FPV Cockpit Cam
        const fpvPos = flightState.pos.clone().add(new THREE.Vector3(0, 0.3, -0.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), flightState.yaw));
        camera.position.copy(fpvPos);
        const fpvLook = flightState.pos.clone().add(new THREE.Vector3(0, 0.2, -15).applyAxisAngle(new THREE.Vector3(0, 1, 0), flightState.yaw));
        camera.lookAt(fpvLook);
    }

    // 6. Update Flight HUD Readouts
    updateFlightHudTelemetry(groundHeight);
}

function updateFlightHudTelemetry(groundY) {
    const hudAlt = document.getElementById('hudValAlt');
    const hudSpd = document.getElementById('hudValSpd');
    const hudCoords = document.getElementById('hudValCoords');
    const hudHaz = document.getElementById('hudHazardWarning');

    const agl = Math.max(0, flightState.pos.y - groundY);
    const knots = Math.round(flightState.vel.length() * 45);

    if (hudAlt) hudAlt.innerText = `${(agl * 12.5).toFixed(0)}m AGL`;
    if (hudSpd) hudSpd.innerText = `${knots} kts`;
    if (hudCoords) hudCoords.innerText = `LAT: ${(30.732 + flightState.pos.z * 0.001).toFixed(4)} N | LON: ${(79.066 + flightState.pos.x * 0.001).toFixed(4)} E`;

    // Low Altitude Proximity Alert
    if (hudHaz) {
        if (agl < 3.5) {
            hudHaz.style.display = 'block';
            hudHaz.innerText = '⚠️ TERRAIN PROXIMITY ALERT - PULL UP';
        } else {
            hudHaz.style.display = 'none';
        }
    }
}

function updateFlightHudCamBadge() {
    const badge = document.getElementById('hudCamBadge');
    if (badge) {
        badge.innerText = cameraFlightMode === 'chase' ? '📷 CHASE CAM (V to FPV)' : '🎯 FPV COCKPIT (V to Chase)';
    }
}

// Hook into three_terrain.js animation loop automatically
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initDroneFlightSystem, 1000);
    });
}
