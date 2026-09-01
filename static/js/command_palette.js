
/* ==========================================================================
   ⚡ GLOBAL COMMAND PALETTE (RAYCAST / LINEAR STYLE) - Ctrl+K / Cmd+K
   ========================================================================== */

const COMMANDS_DATA = [
    // --- QUICK NAVIGATION ---
    { id: 'nav-dash', category: 'Navigation', icon: '🏔️', title: '3D Digital Twin Dashboard', shortcut: 'G D', action: () => window.location.href = '/dashboard' },
    { id: 'nav-uav', category: 'Navigation', icon: '🚁', title: 'Live UAV Drone Thermal Feed', shortcut: 'G U', action: () => window.location.href = '/uav-feed' },
    { id: 'nav-analytics', category: 'Navigation', icon: '📊', title: 'Analytics & Diagnostic Charts', shortcut: 'G A', action: () => window.location.href = '/analytics' },
    { id: 'nav-damage', category: 'Navigation', icon: '🔍', title: 'Before/After Damage Assessment Slider', shortcut: 'G K', action: () => window.location.href = '/damage-assessment' },
    { id: 'nav-briefing', category: 'Navigation', icon: '📄', title: 'Official NDMA Situation Briefing (SITREP)', shortcut: 'G B', action: () => window.location.href = '/intelligence-briefing' },
    { id: 'nav-physics', category: 'Navigation', icon: '🧪', title: 'Catchment Hydrodynamic Physics Lab & LiDAR Slicer', shortcut: 'G P', action: () => window.location.href = '/physics-sandbox' },
    { id: 'nav-hub', category: 'Navigation', icon: '⚡', title: '21st.dev Component Registry & Design Engineering Hub', shortcut: 'G U', action: () => window.location.href = '/components-hub' },
    { id: 'nav-sos', category: 'Navigation', icon: '🚨', title: 'Citizen Flood SOS & Geotagged Incident Reporter', shortcut: 'G I', action: () => window.location.href = '/report-incident' },
    { id: 'nav-early', category: 'Navigation', icon: '🚨', title: 'Emergency Early Warning Center', shortcut: 'G E', action: () => window.location.href = '/early-warning' },
    { id: 'nav-sim', category: 'Navigation', icon: '🧪', title: 'Scenario Simulator & SHAP', shortcut: 'G S', action: () => window.location.href = '/predict' },
    { id: 'nav-time', category: 'Navigation', icon: '⏳', title: 'Historical Disaster Time-Machine', shortcut: 'G T', action: () => window.location.href = '/time-machine' },
    { id: 'nav-sat', category: 'Navigation', icon: '🛰️', title: 'Satellite Constellation Radar', shortcut: 'G R', action: () => window.location.href = '/satellites' },
    { id: 'nav-models', category: 'Navigation', icon: '🧠', title: 'AI Models Hub & Benchmarks', shortcut: 'G M', action: () => window.location.href = '/models-hub' },
    { id: 'nav-api', category: 'Navigation', icon: '⚡', title: 'Developer API Explorer Hub', shortcut: 'G X', action: () => window.location.href = '/api-explorer' },
    { id: 'nav-feedback', category: 'Navigation', icon: '💬', title: 'Community Feedback & Reviews', shortcut: 'G F', action: () => window.location.href = '/feedback' },
    
    // --- LIVE SIMULATION ACTIONS ---
    { id: 'act-drone', category: 'Simulation Actions', icon: '🎮', title: 'Pilot 3D Inspection Drone (WASD)', shortcut: 'P', action: () => {
        closeCommandPalette();
        if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard?auto_drone=1';
        } else if (typeof toggleInteractiveDroneFlight === 'function') {
            toggleInteractiveDroneFlight();
        }
    }},
    { id: 'act-evac', category: 'Simulation Actions', icon: '🏃', title: 'Run AI Boids Crowd Evacuation Sim', shortcut: 'E', action: () => {
        closeCommandPalette();
        if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard?auto_evac=1';
        } else if (typeof initEvacuationSim === 'function') {
            initEvacuationSim();
        }
    }},
    { id: 'act-rain', category: 'Simulation Actions', icon: '⛈️', title: 'Trigger Heavy Cloudburst Storm', shortcut: 'C', action: () => {
        closeCommandPalette();
        if (typeof set3DAtmosphere === 'function') set3DAtmosphere('cloudburst');
        if (typeof setRainIntensity === 'function') setRainIntensity(95);
    }},
    { id: 'act-clear', category: 'Simulation Actions', icon: '☀️', title: 'Clear Atmosphere & Storm Effects', shortcut: 'K', action: () => {
        closeCommandPalette();
        if (typeof set3DAtmosphere === 'function') set3DAtmosphere('clear');
        if (typeof setRainIntensity === 'function') setRainIntensity(0);
    }},
    { id: 'act-lang-hi', category: 'Language / भाषा', icon: '🇮🇳', title: 'हिंदी में अनुवाद करें (Hindi - Uttarakhand / Garhwal)', shortcut: 'L H', action: () => { setLanguage('hi'); closeCommandPalette(); } },
    { id: 'act-lang-ml', category: 'Language / ഭാഷ', icon: '🌴', title: 'മലയാളത്തിലേക്ക് മാറ്റുക (Malayalam - Wayanad / Kerala)', shortcut: 'L M', action: () => { setLanguage('ml'); closeCommandPalette(); } },
    { id: 'act-lang-en', category: 'Language', icon: '🇬🇧', title: 'Switch to English (Global)', shortcut: 'L E', action: () => { setLanguage('en'); closeCommandPalette(); } },
    { id: 'act-sound', category: 'Simulation Actions', icon: '🔊', title: 'Toggle Spatial Sonic Web Audio (Haptic Clicks & Drones)', shortcut: 'M', action: () => { toggleGlobalAudio(); closeCommandPalette(); } },
    { id: 'act-siren', category: 'Simulation Actions', icon: '🔊', title: 'Toggle Emergency Audio Siren', shortcut: 'S', action: () => {
        closeCommandPalette();
        if (typeof toggleEmergencySiren === 'function') toggleEmergencySiren();
    }},
    { id: 'act-cap', category: 'Simulation Actions', icon: '📥', title: 'Export Oasis CAP v1.2 Alert Payload', shortcut: 'X', action: () => {
        window.open('/api/export-cap-alert', '_blank');
        closeCommandPalette();
    }},

    // --- CATCHMENT BASIN JUMP ---
    { id: 'stn-kd', category: 'Catchment Stations', icon: '📍', title: 'Kedarnath Mandakini Gorge (STN-KD-05)', shortcut: '1', action: () => window.location.href = '/dashboard?station=STN-KD-05' },
    { id: 'stn-al', category: 'Catchment Stations', icon: '📍', title: 'Alaknanda Upper Gorge (STN-AL-02)', shortcut: '2', action: () => window.location.href = '/dashboard?station=STN-AL-02' },
    { id: 'stn-kl', category: 'Catchment Stations', icon: '📍', title: 'Kullu Valley Catchment (STN-KL-01)', shortcut: '3', action: () => window.location.href = '/dashboard?station=STN-KL-01' },
    { id: 'stn-ts', category: 'Catchment Stations', icon: '📍', title: 'Teesta River Basin (STN-TS-03)', shortcut: '4', action: () => window.location.href = '/dashboard?station=STN-TS-03' },
    { id: 'stn-ch', category: 'Catchment Stations', icon: '📍', title: 'Chamoli Rishiganga (STN-CH-06)', shortcut: '5', action: () => window.location.href = '/dashboard?station=STN-CH-06' },
    { id: 'stn-wy', category: 'Catchment Stations', icon: '📍', title: 'Wayanad Meppadi Basin (STN-WY-07)', shortcut: '6', action: () => window.location.href = '/dashboard?station=STN-WY-07' }
];

let selectedIndex = 0;
let filteredCommands = [...COMMANDS_DATA];

document.addEventListener('DOMContentLoaded', () => {
    // Keyboard Shortcut Listener (Ctrl+K or Cmd+K)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        } else if (e.key === 'Escape') {
            const modal = document.getElementById('globalCommandPaletteModal');
            if (modal && modal.style.display === 'flex') {
                closeCommandPalette();
            }
        }
    });

    // Check for auto action query params (e.g. ?auto_drone=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto_drone') === '1') {
        setTimeout(() => { if (typeof toggleInteractiveDroneFlight === 'function') toggleInteractiveDroneFlight(); }, 1200);
    }
    if (urlParams.get('auto_evac') === '1') {
        setTimeout(() => { if (typeof initEvacuationSim === 'function') initEvacuationSim(); }, 1200);
    }
});

function toggleCommandPalette() {
    const modal = document.getElementById('globalCommandPaletteModal');
    if (!modal) return;
    
    if (modal.style.display === 'flex') {
        closeCommandPalette();
    } else {
        modal.style.display = 'flex';
        const input = document.getElementById('commandPaletteSearchInput');
        if (input) {
            input.value = '';
            input.focus();
        }
        filterCommandList('');
    }
}

function closeCommandPalette() {
    const modal = document.getElementById('globalCommandPaletteModal');
    if (modal) modal.style.display = 'none';
}

function filterCommandList(query) {
    const q = query.trim().toLowerCase();
    
    if (!q) {
        filteredCommands = [...COMMANDS_DATA];
    } else {
        filteredCommands = COMMANDS_DATA.filter(cmd => 
            cmd.title.toLowerCase().includes(q) || 
            cmd.category.toLowerCase().includes(q) ||
            cmd.shortcut.toLowerCase().includes(q)
        );
    }
    
    selectedIndex = 0;
    renderCommandList();
}

function renderCommandList() {
    const listEl = document.getElementById('commandPaletteResultsList');
    if (!listEl) return;
    
    if (filteredCommands.length === 0) {
        listEl.innerHTML = `
            <div class="palette-empty-state">
                <span class="empty-icon">🔍</span>
                <p>No matching commands or basins found.</p>
                <small>Try typing "Drone", "Kedarnath", "Cloudburst", or "Analytics"</small>
            </div>
        `;
        return;
    }
    
    // Group by category
    const categories = {};
    filteredCommands.forEach((cmd, idx) => {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        categories[cmd.category].push({ ...cmd, globalIndex: idx });
    });
    
    let html = '';
    Object.keys(categories).forEach(catName => {
        html += `<div class="palette-category-header">${catName}</div>`;
        categories[catName].forEach(cmd => {
            const isSelected = cmd.globalIndex === selectedIndex;
            html += `
                <div class="palette-item ${isSelected ? 'selected' : ''}" 
                     onclick="executeCommand(${cmd.globalIndex})"
                     onmouseenter="setPaletteSelection(${cmd.globalIndex})">
                    <span class="palette-item-icon">${cmd.icon}</span>
                    <span class="palette-item-title">${cmd.title}</span>
                    <span class="palette-item-shortcut">${cmd.shortcut}</span>
                </div>
            `;
        });
    });
    
    listEl.innerHTML = html;
    
    // Scroll selected into view
    const selectedEl = listEl.querySelector('.palette-item.selected');
    if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
}

function setPaletteSelection(index) {
    selectedIndex = index;
    const items = document.querySelectorAll('.palette-item');
    items.forEach((it, idx) => {
        it.classList.toggle('selected', idx === index);
    });
}

function handlePaletteKeyNav(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        renderCommandList();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderCommandList();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
            executeCommand(selectedIndex);
        }
    }
}

function executeCommand(index) {
    const cmd = filteredCommands[index];
    if (cmd && typeof cmd.action === 'function') {
        cmd.action();
    }
}
