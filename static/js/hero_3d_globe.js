/* ==========================================================================
   HYDROSENTINEL AI™ - 3D MULTI-SOURCE HYDROLOGICAL EARTH ENGINE (THREE.JS)
   - Real-Time Geospatial Earth with Atmospheric Corona Shader Glow
   - Multi-Satellite Orbital Tracking (NASA GPM, Sentinel-1, ISRO INSAT, NOAA-20)
   - Animated Conical Sensor Radar Scans & Orbital Trajectory Splines
   - Hydrological River Vector Particle Flows with Dynamic Surge Velocity
   - 3D Geo-Referenced Pulsing Station Beacons with Live Multi-Source Risk Tiers
   - Active Global Geohazards (NASA EONET Floods/Storms & USGS Seismicity)
   - Interactive Raycasting, Smooth Camera Focus, and Floating Glassmorphic HUD
   - Real-Time Streaming Telemetry Ingestion (/api/realtime/multi-source & SSE)
   ========================================================================== */

(function () {
    'use strict';

    let scene, camera, renderer, controls;
    let globeGroup, satelliteGroup, stationGroup, hazardGroup, streamGroup;
    let earthMesh, atmosphereMesh, gridMesh;
    let raycaster, mouse;
    let satellitesData = [];
    let stationsData = [];
    let hazardsData = [];
    let isTrackingSatellite = false;
    let trackedSatObject = null;
    let sseSource = null;
    let autoRotate = true;
    let activeFilter = 'ALL';

    const GLOBE_RADIUS = 12.0;

    // Helper: Convert Lat/Lon to 3D Cartesian coordinates on sphere
    function latLonToVector3(lat, lon, radius, altOffset = 0) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const r = radius + altOffset;
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    document.addEventListener('DOMContentLoaded', () => {
        initHero3DEarth();
        initRealtimeTelemetryStream();
        initFilterControls();
    });

    function initHero3DEarth() {
        const container = document.getElementById('hero3DViewer');
        if (!container || typeof THREE === 'undefined') return;

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 450;

        // 1. Scene & Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 18, 38);

        // 2. WebGL Renderer with High-DPI Support
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 3. Orbit Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.8;
            controls.enableZoom = false; // Prevent page scroll hijack; enabled on hover
            controls.minDistance = 18;
            controls.maxDistance = 75;

            // Hover zoom safety
            container.addEventListener('mouseenter', () => { if (controls) controls.enableZoom = true; });
            container.addEventListener('mouseleave', () => { if (controls) controls.enableZoom = false; });
            
            // User interaction halts satellite camera lock
            controls.addEventListener('start', () => {
                isTrackingSatellite = false;
                trackedSatObject = null;
            });
        }

        // 4. Lighting Rig
        const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
        sunLight.position.set(40, 30, 40);
        scene.add(sunLight);

        const rimLight = new THREE.DirectionalLight(0x818cf8, 1.8);
        rimLight.position.set(-35, -20, -35);
        scene.add(rimLight);

        const pointLight = new THREE.PointLight(0x00f0ff, 1.5, 80);
        pointLight.position.set(0, 0, 30);
        scene.add(pointLight);

        // 5. Container Groups
        globeGroup = new THREE.Group();
        satelliteGroup = new THREE.Group();
        stationGroup = new THREE.Group();
        hazardGroup = new THREE.Group();
        streamGroup = new THREE.Group();

        scene.add(globeGroup);
        scene.add(satelliteGroup);
        scene.add(stationGroup);
        scene.add(hazardGroup);
        scene.add(streamGroup);

        // 6. Build Earth & Atmosphere
        buildEarthGlobe();
        buildAtmosphereCorona();
        buildTacticalCoordinateGrid();
        buildHydrologicalStreamFlows();

        // 7. Raycasting for Interactive Hover/Click
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        setupRaycasting(container);

        // 8. Initial Satellite & Station Markers
        fetchInitialMultiSourceData();

        // 9. Resize Listener
        window.addEventListener('resize', onWindowResize, { passive: true });

        // 10. Start 60/120 FPS Render Loop
        animate();
    }

    // =========================================================================
    // 3D GEOMETRIES & SHADERS
    // =========================================================================
    function buildEarthGlobe() {
        const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
        
        // Procedural High-Tech Terrain Relief Material
        const globeMat = new THREE.MeshStandardMaterial({
            color: 0x050d24,
            roughness: 0.35,
            metalness: 0.75,
            emissive: 0x071b3b,
            emissiveIntensity: 0.25
        });

        earthMesh = new THREE.Mesh(globeGeo, globeMat);
        globeGroup.add(earthMesh);

        // Holographic Wireframe Cage
        const wireGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 1.008, 16);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            wireframe: true,
            transparent: true,
            opacity: 0.16
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        globeGroup.add(wireMesh);

        // Continental Coastline Contour Rings
        buildContinentalAccents();
    }

    function buildAtmosphereCorona() {
        // Glowing Outer Atmospheric Corona
        const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 48, 48);
        const atmosMat = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
                    gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity * 1.4;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
        globeGroup.add(atmosphereMesh);
    }

    function buildTacticalCoordinateGrid() {
        // Equator and Tropics Latitude Rings
        const ringLats = [0, 23.5, -23.5, 45, -45];
        ringLats.forEach(lat => {
            const rad = GLOBE_RADIUS * Math.cos(lat * Math.PI / 180) * 1.005;
            const y = GLOBE_RADIUS * Math.sin(lat * Math.PI / 180) * 1.005;
            const circleGeo = new THREE.BufferGeometry();
            const pts = [];
            for (let i = 0; i <= 64; i++) {
                const angle = (i / 64) * Math.PI * 2;
                pts.push(Math.cos(angle) * rad, y, Math.sin(angle) * rad);
            }
            circleGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
            const ringMat = new THREE.LineBasicMaterial({
                color: lat === 0 ? 0x38bdf8 : 0x0369a1,
                transparent: true,
                opacity: lat === 0 ? 0.35 : 0.18
            });
            gridMesh = new THREE.Line(circleGeo, ringMat);
            globeGroup.add(gridMesh);
        });
    }

    function buildContinentalAccents() {
        // High-density regional nodes for major continents
        const continentalNodes = [
            // Indian Subcontinent & Himalayas
            [30.7, 79.1], [31.9, 77.1], [27.3, 88.6], [9.8, 77.0], [28.6, 77.2], [19.0, 72.8], [13.0, 80.2],
            // Asia & Pacific
            [35.6, 139.6], [39.9, 116.4], [1.3, 103.8], [37.5, 126.9], [-33.8, 151.2],
            // Europe
            [51.5, -0.1], [48.8, 2.3], [46.8, 8.2], [52.5, 13.4], [41.9, 12.5],
            // Americas
            [40.7, -74.0], [34.0, -118.2], [37.7, -122.4], [-23.5, -46.6], [-34.6, -58.3], [19.4, -99.1],
            // Africa & Middle East
            [30.0, 31.2], [-1.2, 36.8], [-26.2, 28.0], [25.2, 55.2]
        ];

        const particleGeo = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        continentalNodes.forEach(([lat, lon]) => {
            const v = latLonToVector3(lat, lon, GLOBE_RADIUS, 0.08);
            positions.push(v.x, v.y, v.z);
            // Cyan for Indian/Himalayan cluster, subtle steel blue for others
            if (lat >= 8 && lat <= 36 && lon >= 68 && lon <= 97) {
                colors.push(0.22, 0.74, 0.97);
            } else {
                colors.push(0.08, 0.35, 0.55);
            }
        });

        particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });

        const points = new THREE.Points(particleGeo, particleMat);
        globeGroup.add(points);
    }

    // =========================================================================
    // HYDROLOGICAL STREAM FLOW PARTICLES
    // =========================================================================
    let riverParticleSystems = [];

    function buildHydrologicalStreamFlows() {
        // Stream vectors across major high-risk drainage basins
        const riverBasinArcs = [
            // Mandakini & Alaknanda (Kedarnath -> Devprayag -> Haridwar)
            [[30.73, 79.06], [30.55, 79.56], [30.14, 78.59], [29.94, 78.16]],
            // Teesta River (North Sikkim -> Jalpaiguri)
            [[27.85, 88.75], [27.33, 88.60], [26.54, 88.71], [25.30, 89.60]],
            // Beas River (Rohtang Pass -> Kullu -> Pong Dam)
            [[32.37, 77.20], [31.95, 77.10], [31.80, 76.90], [31.98, 75.95]],
            // Periyar River (Western Ghats -> Idukki -> Arabian Sea)
            [[9.84, 76.98], [9.85, 76.85], [10.02, 76.35], [10.19, 76.18]]
        ];

        riverBasinArcs.forEach((coords) => {
            const points = coords.map(([lat, lon]) => latLonToVector3(lat, lon, GLOBE_RADIUS, 0.12));
            const curve = new THREE.CatmullRomCurve3(points);

            // Glowing Arc Track
            const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.04, 8, false);
            const tubeMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.4
            });
            const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
            streamGroup.add(tubeMesh);

            // Flow Particles traveling down river
            const count = 14;
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(count * 3);
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

            const pMat = new THREE.PointsMaterial({
                color: 0x38bdf8,
                size: 0.35,
                transparent: true,
                opacity: 0.95
            });

            const pMesh = new THREE.Points(pGeo, pMat);
            streamGroup.add(pMesh);

            riverParticleSystems.push({
                curve: curve,
                pointsMesh: pMesh,
                count: count,
                offsets: Array.from({ length: count }, (_, i) => i / count),
                speed: 0.0015
            });
        });
    }

    function updateRiverFlows() {
        riverParticleSystems.forEach(sys => {
            const pos = sys.pointsMesh.geometry.attributes.position;
            for (let i = 0; i < sys.count; i++) {
                sys.offsets[i] = (sys.offsets[i] + sys.speed) % 1.0;
                const pt = sys.curve.getPointAt(sys.offsets[i]);
                pos.setXYZ(i, pt.x, pt.y, pt.z);
            }
            pos.needsUpdate = true;
        });
    }

    // =========================================================================
    // SATELLITES WITH DYNAMIC SCAN CONES
    // =========================================================================
    let satelliteObjects = [];

    function renderSatellites(satList) {
        satelliteGroup.clear();
        satelliteObjects = [];

        satList.forEach((sat, idx) => {
            const group = new THREE.Group();
            group.userData = { type: 'satellite', data: sat };

            const altScale = Math.min(26.0, GLOBE_RADIUS + (sat.altitude_km / 1000.0) * 3.5);
            const satPos = latLonToVector3(sat.latitude, sat.longitude, altScale);
            group.position.copy(satPos);

            // Satellite Core Body
            const bodyGeo = new THREE.BoxGeometry(0.5, 0.35, 0.35);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.9,
                roughness: 0.2
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            group.add(body);

            // Solar Array Wings
            const wingGeo = new THREE.BoxGeometry(1.6, 0.04, 0.5);
            const wingMat = new THREE.MeshStandardMaterial({
                color: 0x1e3a8a,
                emissive: 0x0284c7,
                emissiveIntensity: 0.5,
                metalness: 0.8
            });
            const wing = new THREE.Mesh(wingGeo, wingMat);
            group.add(wing);

            // Satellite Glow Orb
            const glowGeo = new THREE.SphereGeometry(0.4, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(sat.color || '#38bdf8'),
                transparent: true,
                opacity: 0.85
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            group.add(glow);

            // Orbital Trajectory Spline
            const orbitRingGeo = new THREE.BufferGeometry();
            const ringPts = [];
            for (let i = 0; i <= 64; i++) {
                const angle = (i / 64) * Math.PI * 2;
                const r = altScale;
                // Inclination tilt based on sat
                const inc = sat.id.includes('GPM') ? 1.1 : (sat.id.includes('INSAT') ? 0.05 : 1.4);
                ringPts.push(
                    Math.cos(angle) * r,
                    Math.sin(angle) * Math.sin(inc) * r,
                    Math.sin(angle) * Math.cos(inc) * r
                );
            }
            orbitRingGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPts, 3));
            const orbitMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(sat.color || '#38bdf8'),
                transparent: true,
                opacity: 0.25
            });
            const orbitLine = new THREE.Line(orbitRingGeo, orbitMat);
            satelliteGroup.add(orbitLine);

            // Conical Radar Beam projecting to surface
            const groundPt = latLonToVector3(sat.latitude, sat.longitude, GLOBE_RADIUS);
            const beamDist = satPos.distanceTo(groundPt);
            const coneGeo = new THREE.ConeGeometry(1.2, beamDist, 16, 1, true);
            coneGeo.translate(0, -beamDist / 2, 0);
            coneGeo.rotateX(-Math.PI / 2);

            const coneMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(sat.color || '#38bdf8'),
                transparent: true,
                opacity: 0.18,
                side: THREE.DoubleSide
            });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.lookAt(groundPt);
            group.add(cone);

            satelliteGroup.add(group);
            satelliteObjects.push({ group: group, data: sat });
        });
    }

    // =========================================================================
    // 3D STATION BEACONS WITH RISK-BASED PULSING
    // =========================================================================
    let stationObjects = [];

    function renderStations(stationsList) {
        stationGroup.clear();
        stationObjects = [];

        stationsList.forEach(stn => {
            const group = new THREE.Group();
            group.userData = { type: 'station', data: stn };

            const pos = latLonToVector3(stn.latitude, stn.longitude, GLOBE_RADIUS, 0.15);
            group.position.copy(pos);

            const normal = pos.clone().normalize();

            // 1. Base Core Beacon
            const coreGeo = new THREE.SphereGeometry(0.32, 16, 16);
            const coreMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(stn.alert_color || '#10b981')
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // 2. Vertical Light Pillar
            const pillarHeight = stn.risk_tier === 'CRITICAL' ? 3.6 : (stn.risk_tier === 'ELEVATED' ? 2.4 : 1.5);
            const pillarGeo = new THREE.CylinderGeometry(0.04, 0.08, pillarHeight, 8);
            pillarGeo.translate(0, pillarHeight / 2, 0);
            const pillarMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(stn.alert_color || '#10b981'),
                transparent: true,
                opacity: 0.75
            });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
            group.add(pillar);

            // 3. Concentric Expanding Radar Ring
            const ringGeo = new THREE.RingGeometry(0.2, 0.55, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(stn.alert_color || '#10b981'),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.lookAt(normal.clone().multiplyScalar(2));
            group.add(ring);

            stationGroup.add(group);
            stationObjects.push({ group: group, ring: ring, stn: stn, phase: Math.random() * Math.PI });
        });
    }

    // =========================================================================
    // ACTIVE GLOBAL GEOHAZARDS (NASA & USGS)
    // =========================================================================
    let hazardObjects = [];

    function renderHazards(hazardList) {
        hazardGroup.clear();
        hazardObjects = [];

        hazardList.forEach(haz => {
            const group = new THREE.Group();
            group.userData = { type: 'hazard', data: haz };

            const pos = latLonToVector3(haz.latitude, haz.longitude, GLOBE_RADIUS, 0.18);
            group.position.copy(pos);

            // Octahedron Hazard Diamond
            const octGeo = new THREE.OctahedronGeometry(0.28);
            const octMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(haz.color || '#ef4444'),
                wireframe: false
            });
            const oct = new THREE.Mesh(octGeo, octMat);
            group.add(oct);

            hazardGroup.add(group);
            hazardObjects.push({ group: group, oct: oct, haz: haz });
        });
    }

    // =========================================================================
    // RAYCASTING & INTERACTIVE HUD TOOLTIP
    // =========================================================================
    let hoveredObject = null;

    function setupRaycasting(container) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

            checkIntersection(e);
        });

        container.addEventListener('click', (e) => {
            if (hoveredObject) {
                handleObjectClick(hoveredObject);
            }
        });
    }

    function checkIntersection(e) {
        if (!raycaster || !camera) return;

        raycaster.setFromCamera(mouse, camera);
        const interactables = [];

        stationObjects.forEach(s => interactables.push(s.group.children[0]));
        satelliteObjects.forEach(s => interactables.push(s.group.children[0]));
        hazardObjects.forEach(h => interactables.push(h.group.children[0]));

        const intersects = raycaster.intersectObjects(interactables, false);

        if (intersects.length > 0) {
            const hit = intersects[0].object.parent;
            if (hit && hit.userData) {
                hoveredObject = hit;
                document.body.style.cursor = 'pointer';
                showTooltip(hit.userData, e.clientX, e.clientY);
                return;
            }
        }

        hoveredObject = null;
        document.body.style.cursor = 'default';
        hideTooltip();
    }

    function handleObjectClick(obj) {
        if (!obj || !obj.userData) return;
        const udata = obj.userData;

        if (udata.type === 'satellite') {
            isTrackingSatellite = true;
            trackedSatObject = obj;
            flashStatus(`🛰️ Tracking Satellite: ${udata.data.name}`);
        } else if (udata.type === 'station') {
            smoothFocusCamera(obj.position, 28);
            flashStatus(`📍 Focused Basin: ${udata.data.name}`);
        }
    }

    function smoothFocusCamera(targetPos, targetDistance) {
        if (!controls || !camera) return;
        controls.autoRotate = false;

        const targetNorm = targetPos.clone().normalize();
        const endCamPos = targetNorm.clone().multiplyScalar(targetDistance);

        let t = 0;
        const startPos = camera.position.clone();

        function step() {
            t += 0.04;
            if (t <= 1.0) {
                camera.position.lerpVectors(startPos, endCamPos, easeOutCubic(t));
                controls.target.set(0, 0, 0);
                controls.update();
                requestAnimationFrame(step);
            }
        }
        step();
    }

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    // =========================================================================
    // FLOATING GLASSMORPHIC HUD TOOLTIP
    // =========================================================================
    let hudTooltip = null;

    function getOrCreateHUD() {
        if (!hudTooltip) {
            hudTooltip = document.createElement('div');
            hudTooltip.id = 'hero3DHUDTooltip';
            hudTooltip.className = 'liquid-glass';
            hudTooltip.style.cssText = `
                position: fixed;
                display: none;
                z-index: 99999;
                pointer-events: none;
                padding: 14px 18px;
                border-radius: 14px;
                background: rgba(3, 7, 18, 0.92);
                border: 1px solid rgba(56, 189, 248, 0.4);
                backdrop-filter: blur(16px);
                box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(56, 189, 248, 0.2);
                color: #ffffff;
                font-family: var(--font-body);
                min-width: 260px;
                max-width: 320px;
                transform: translate(15px, -50%);
                transition: opacity 0.15s ease;
            `;
            document.body.appendChild(hudTooltip);
        }
        return hudTooltip;
    }

    function showTooltip(userData, clientX, clientY) {
        const hud = getOrCreateHUD();
        const { type, data } = userData;

        let html = '';
        if (type === 'station') {
            html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">
                    <strong style="font-size:0.92rem; color:#ffffff;">${data.name}</strong>
                    <span style="background:${data.alert_color}; color:#000; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:999px;">${data.risk_tier}</span>
                </div>
                <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:6px;">
                    🌊 <em>${data.river}</em> &bull; ${data.elevation_m}m AMSL
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.75rem; font-family:var(--font-mono); margin-top:8px;">
                    <div>🌧️ Rain: <strong style="color:#38bdf8;">${data.rainfall_mm_h} mm/h</strong></div>
                    <div>📊 Stage: <strong style="color:#f59e0b;">${data.river_stage_m} m</strong></div>
                    <div>🌊 GloFAS: <strong style="color:#38bdf8;">${data.glofas_discharge_m3_s} m³/s</strong></div>
                    <div>⚡ CAPE: <strong style="color:#c084fc;">${data.convective_cape_j_kg} J/kg</strong></div>
                </div>
                <div style="font-size:0.68rem; color:#64748b; margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:4px;">
                    📡 Sync: Open-Meteo & GloFAS & ISRO
                </div>
            `;
        } else if (type === 'satellite') {
            html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">
                    <strong style="font-size:0.92rem; color:#38bdf8;">${data.name}</strong>
                    <span style="font-size:0.68rem; font-family:var(--font-mono); color:#cbd5e1;">NORAD ${data.norad_cat_id}</span>
                </div>
                <div style="font-size:0.78rem; color:#cbd5e1; margin-bottom:6px;">
                    📡 <strong>Payload:</strong> ${data.type}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.75rem; font-family:var(--font-mono); margin-top:8px;">
                    <div>🛰️ Alt: <strong style="color:#ffffff;">${data.altitude_km} km</strong></div>
                    <div>🚀 Speed: <strong style="color:#ffffff;">${data.velocity_km_s} km/s</strong></div>
                    <div>📐 Swath: <strong style="color:#38bdf8;">${data.swath_width_km} km</strong></div>
                    <div>🌐 Lat/Lon: <strong style="color:#38bdf8;">${data.latitude}°, ${data.longitude}°</strong></div>
                </div>
                <div style="font-size:0.68rem; color:#10b981; margin-top:8px; font-weight:700;">
                    🟢 STATUS: ${data.status}
                </div>
            `;
        } else if (type === 'hazard') {
            html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">
                    <strong style="font-size:0.88rem; color:#ef4444;">🚨 ${data.category}</strong>
                    <span style="font-size:0.65rem; background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid #ef4444; padding:2px 6px; border-radius:4px;">${data.severity}</span>
                </div>
                <div style="font-size:0.78rem; color:#ffffff; font-weight:600; margin-bottom:4px;">
                    ${data.title}
                </div>
                <div style="font-size:0.72rem; color:#94a3b8; font-family:var(--font-mono);">
                    📍 ${data.latitude}°, ${data.longitude}° &bull; ${data.source}
                </div>
            `;
        }

        hud.innerHTML = html;
        hud.style.left = `${clientX}px`;
        hud.style.top = `${clientY}px`;
        hud.style.display = 'block';
    }

    function hideTooltip() {
        if (hudTooltip) hudTooltip.style.display = 'none';
    }

    function flashStatus(msg) {
        const pill = document.querySelector('.live-status-pill');
        if (pill) {
            const orig = pill.innerHTML;
            pill.innerHTML = `<span class="dot-green"></span> ${msg}`;
            setTimeout(() => { pill.innerHTML = orig; }, 3500);
        }
    }

    // =========================================================================
    // REAL-TIME DATA STREAMING (/api/realtime/stream & /api/realtime/multi-source)
    // =========================================================================
    function fetchInitialMultiSourceData() {
        fetch('/api/realtime/multi-source')
            .then(res => res.json())
            .then(payload => {
                if (payload && payload.status === 'SUCCESS') {
                    updateSceneData(payload);
                }
            })
            .catch(err => console.debug('Multi-source fallback:', err));
    }

    function initRealtimeTelemetryStream() {
        // SSE Real-Time Live Feed
        if (typeof EventSource !== 'undefined') {
            try {
                sseSource = new EventSource('/api/realtime/stream');
                sseSource.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload && payload.status === 'SUCCESS') {
                            updateSceneData(payload);
                        }
                    } catch (e) {
                        console.debug('SSE parse error:', e);
                    }
                };
                sseSource.onerror = () => {
                    if (sseSource) sseSource.close();
                    // Fallback to polling every 5 seconds
                    setInterval(fetchInitialMultiSourceData, 5000);
                };
            } catch (e) {
                setInterval(fetchInitialMultiSourceData, 5000);
            }
        } else {
            setInterval(fetchInitialMultiSourceData, 5000);
        }
    }

    function updateSceneData(payload) {
        stationsData = payload.stations || [];
        satellitesData = payload.satellites || [];
        hazardsData = payload.global_hazards || [];

        renderSatellites(satellitesData);
        renderStations(stationsData);
        renderHazards(hazardsData);
        updateMetricsRibbon(payload);
    }

    function updateMetricsRibbon(payload) {
        const summary = payload.summary || {};
        const sources = payload.sources || {};

        // Update live stats ribbon on index.html
        const latencyEl = document.querySelector('.val-purple');
        if (latencyEl) latencyEl.textContent = `${payload.sync_latency_ms || 3.8}ms`;

        const packetEl = document.querySelector('.val-cyan');
        if (packetEl && payload.total_packets_processed) {
            packetEl.textContent = payload.total_packets_processed.toLocaleString();
        }

        const syncEl = document.querySelector('.val-green');
        if (syncEl) {
            syncEl.textContent = `8/8 SYNCED (${summary.satellites_tracking || 4} SATS)`;
        }

        const leadEl = document.querySelector('.val-amber');
        if (leadEl) {
            leadEl.textContent = `${summary.active_hazards_count || 4} ACTIVE HAZARDS`;
        }
    }

    // =========================================================================
    // INTERACTIVE FILTER CONTROLS & CAMERA QUICK-ACTIONS
    // =========================================================================
    function initFilterControls() {
        // Source Filter Chips
        document.querySelectorAll('.hero-filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.hero-filter-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.getAttribute('data-filter') || 'ALL';
                applyFilterVisibility(activeFilter);
            });
        });

        // Camera Action Buttons
        const btnFocusHimalayas = document.getElementById('btnFocusHimalayas');
        if (btnFocusHimalayas) {
            btnFocusHimalayas.addEventListener('click', () => {
                const himalayasPos = latLonToVector3(30.7, 79.1, GLOBE_RADIUS);
                smoothFocusCamera(himalayasPos, 28);
                flashStatus('🏔️ Focused: Central Himalayan Disaster Arc');
            });
        }

        const btnResetOrbit = document.getElementById('btnResetOrbit');
        if (btnResetOrbit) {
            btnResetOrbit.addEventListener('click', () => {
                isTrackingSatellite = false;
                trackedSatObject = null;
                if (controls) {
                    controls.autoRotate = true;
                    camera.position.set(0, 18, 38);
                    controls.target.set(0, 0, 0);
                    controls.update();
                }
                flashStatus('🔄 Orbit Restored');
            });
        }

        const btnTrackSat = document.getElementById('btnTrackSat');
        if (btnTrackSat) {
            btnTrackSat.addEventListener('click', () => {
                if (satelliteObjects.length > 0) {
                    isTrackingSatellite = true;
                    trackedSatObject = satelliteObjects[0].group;
                    flashStatus(`🛰️ Tracking: ${satelliteObjects[0].data.name}`);
                }
            });
        }
    }

    function applyFilterVisibility(filter) {
        if (filter === 'ALL') {
            satelliteGroup.visible = true;
            stationGroup.visible = true;
            hazardGroup.visible = true;
            streamGroup.visible = true;
        } else if (filter === 'SATELLITES') {
            satelliteGroup.visible = true;
            stationGroup.visible = false;
            hazardGroup.visible = false;
            streamGroup.visible = false;
        } else if (filter === 'STATIONS') {
            satelliteGroup.visible = false;
            stationGroup.visible = true;
            hazardGroup.visible = false;
            streamGroup.visible = true;
        } else if (filter === 'HAZARDS') {
            satelliteGroup.visible = false;
            stationGroup.visible = false;
            hazardGroup.visible = true;
            streamGroup.visible = false;
        }
    }

    // =========================================================================
    // RENDER LOOP (60/120 FPS)
    // =========================================================================
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // 1. River Particle Dynamics
        updateRiverFlows();

        // 2. Station Beacons Pulsing Rings
        stationObjects.forEach(s => {
            s.phase += delta * 2.5;
            const scale = 1.0 + Math.sin(s.phase) * 0.45;
            s.ring.scale.set(scale, scale, scale);
        });

        // 3. Hazard Diamond Tumbling
        hazardObjects.forEach(h => {
            h.oct.rotation.y += delta * 1.5;
            h.oct.rotation.x += delta * 0.8;
        });

        // 4. Satellite Tracking Camera Mode
        if (isTrackingSatellite && trackedSatObject && controls) {
            const worldPos = new THREE.Vector3();
            trackedSatObject.getWorldPosition(worldPos);
            controls.target.lerp(worldPos, 0.08);
            controls.autoRotate = false;
        }

        // 5. Update Orbit Controls
        if (controls) controls.update();

        // 6. Render WebGL
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        const container = document.getElementById('hero3DViewer');
        if (!container || !camera || !renderer) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

})();
