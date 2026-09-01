/* ==========================================================================
   MOTIONSITES.AI - "AI-INTERFACE" MOTION DESIGN ENGINE
   - Live AI Neural Waveform Visualizer (Real-time telemetry pulse bars)
   - Dynamic Laser Scanner Sweep on Hover
   - Real-Time AI Deconvolution Status Ribbon
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAiNeuralWaveform();
    initAiScanlines();
});

// 1. Kinetic AI Neural Waveform Frequency Visualizer
function initAiNeuralWaveform() {
    const container = document.getElementById('aiWaveformCanvas');
    if (!container) return;

    const ctx = container.getContext('2d');
    let width = (container.width = container.offsetWidth || 340);
    let height = (container.height = 42);

    window.addEventListener('resize', () => {
        width = container.width = container.offsetWidth || 340;
        height = container.height = 42;
    });

    const numBars = 32;
    let waveTime = 0;

    function renderWave() {
        ctx.clearRect(0, 0, width, height);
        const barWidth = (width / numBars) - 2.5;

        for (let i = 0; i < numBars; i++) {
            const freq = Math.sin((i * 0.25) + waveTime) * Math.cos((i * 0.15) - waveTime * 1.3);
            const barHeight = Math.max(4, Math.abs(freq) * (height - 6));
            const x = i * (barWidth + 2.5);
            const y = (height - barHeight) / 2;

            const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
            grad.addColorStop(0, '#00f0ff');
            grad.addColorStop(0.5, '#38bdf8');
            grad.addColorStop(1, '#05ffa1');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 2);
            ctx.fill();
        }

        waveTime += 0.045;
        requestAnimationFrame(renderWave);
    }
    renderWave();
}

// 2. Interactive AI Scanning Beam on Cards
function initAiScanlines() {
    document.querySelectorAll('.card, .overview-hero, .station-card, .arch-card').forEach(card => {
        card.classList.add('ai-interface-card');
    });
}
