/* ==========================================================================
   HYDROSENTINEL AI™ - FUTURISTIC WEB AUDIO SYNTHESIS & SOUND FX
   - Synthesizes micro-clicks, hover chimes, and alert telemetry audio
   - Zero external audio files (100% lightweight procedural synthesis)
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// 1. Soft Futuristic UI Click
function playUiClickSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
}

// 2. Subtle Micro Hover Chime
function playUiHoverSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
}

// Attach sound triggers to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-pill, .btn, .nav-link-pill, .tab-btn, .station-card, .arch-card, .form-range').forEach(el => {
        el.addEventListener('mouseenter', () => playUiHoverSound());
        el.addEventListener('click', () => playUiClickSound());
    });
});
