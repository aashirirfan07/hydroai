
/* ==========================================================================
   🔊 SPATIAL SONIC WEB AUDIO SYNTHESIZER ENGINE (HYDROSENTINEL AI)
   - 100% Procedural Web Audio API Synthesis (0mb external audio files)
   - Resonant Glass Chimes, Mechanical Clicks, Sub-Bass Flood Drones, Radio Squelch
   ========================================================================== */

let audioCtx = null;
let isAudioEnabled = true;
let floodDroneGain = null;
let floodDroneOsc1 = null;
let floodDroneOsc2 = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

document.addEventListener('DOMContentLoaded', () => {
    initSpatialAudioEngine();
});

function initSpatialAudioEngine() {
    const saved = localStorage.getItem('hydro_audio_enabled');
    isAudioEnabled = saved === null ? false : saved === 'true';
    updateAudioToggleUI();

    // Auto-bind sound effects to DOM elements
    bindGlobalSoundEffects();

    // Safe user-gesture resume listener
    const resumeOnGesture = () => {
        getAudioContext();
        window.removeEventListener('click', resumeOnGesture);
        window.removeEventListener('keydown', resumeOnGesture);
    };
    window.addEventListener('click', resumeOnGesture);
    window.addEventListener('keydown', resumeOnGesture);
}

function toggleGlobalAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStorage.setItem('hydro_audio_enabled', isAudioEnabled);
    updateAudioToggleUI();

    if (isAudioEnabled) {
        playSuccessChime();
    } else {
        stopFloodDrone();
    }
}

function updateAudioToggleUI() {
    const btn = document.getElementById('globalAudioToggleBtn');
    if (btn) {
        btn.innerHTML = isAudioEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        btn.classList.toggle('audio-active', isAudioEnabled);
        btn.style.color = isAudioEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)';
    }
}

// 1. Crystal Glass Hover Resonance Chime (High Frequency Damped Sine)
function playGlassHover() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6 note

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(12, now);

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    } catch(e) {}
}

// 2. Mechanical Tactile Actuation Click
function playTactileClick() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    } catch(e) {}
}

// 3. Civil Defense Tactical Radio Squelch & Burst
function playRadioSquelch() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * 0.06; // 60ms noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
    } catch(e) {}
}

// 4. Success / Confirmation Ascending Chime
function playSuccessChime() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        [587.33, 880].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.2);
        });
    } catch(e) {}
}

// 5. Federal 2-Tone EAS Warning Siren (853Hz + 960Hz)
function playEASSiren(duration = 1.2) {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(853, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(960, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    } catch(e) {}
}

// 6. Subterranean Sub-Bass Flood Drone (45Hz - 65Hz)
function updateFloodDroneAudio(surgeDepth) {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        if (!floodDroneOsc1) {
            const now = ctx.currentTime;
            floodDroneOsc1 = ctx.createOscillator();
            floodDroneOsc2 = ctx.createOscillator();
            floodDroneGain = ctx.createGain();

            floodDroneOsc1.type = 'sine';
            floodDroneOsc1.frequency.setValueAtTime(45, now);
            floodDroneOsc2.type = 'triangle';
            floodDroneOsc2.frequency.setValueAtTime(48, now); // subtle detune beat

            floodDroneGain.gain.setValueAtTime(0.001, now);

            floodDroneOsc1.connect(floodDroneGain);
            floodDroneOsc2.connect(floodDroneGain);
            floodDroneGain.connect(ctx.destination);

            floodDroneOsc1.start(now);
            floodDroneOsc2.start(now);
        }

        const now = ctx.currentTime;
        const intensity = Math.min(1.0, Math.max(0.0, surgeDepth / 10.0));
        const targetVol = intensity * 0.05;
        const targetFreq = 45 + intensity * 18;

        floodDroneGain.gain.linearRampToValueAtTime(targetVol, now + 0.5);
        floodDroneOsc1.frequency.linearRampToValueAtTime(targetFreq, now + 0.5);
        floodDroneOsc2.frequency.linearRampToValueAtTime(targetFreq + 2.5, now + 0.5);
    } catch(e) {}
}

function stopFloodDrone() {
    if (floodDroneGain && audioCtx) {
        try {
            floodDroneGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        } catch(e) {}
    }
}

// Bind event listeners across the document
function bindGlobalSoundEffects() {
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .spatial-card, .station-glass-card, .tab-btn, .nav-link-pill, .depth-card, .tactile-knob-container');
        if (target) {
            playGlassHover();
        }
    }, { passive: true });

    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .tab-btn, .nav-link-pill, .depth-card, .sat-chip-btn');
        if (target) {
            playTactileClick();
        }
    }, { passive: true });
}
