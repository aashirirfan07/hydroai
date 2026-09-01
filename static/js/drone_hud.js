
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('droneCanvas');
    const ctx = canvas.getContext('2d');
    const targetBox = document.getElementById('targetInfoBox');
    const targetClass = document.getElementById('targetClass');
    const targetConf = document.getElementById('targetConf');

    let width, height;
    let time = 0;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // AI Bounding Box Targets
    const targets = [
        { x: 0.2, y: 0.3, w: 60, h: 60, vx: 0.001, vy: 0.0005, type: 'CIVILIAN VEHICLE', color: '#05ffa1' },
        { x: 0.7, y: 0.6, w: 40, h: 40, vx: -0.0005, vy: -0.001, type: 'STRANDED PERSON', color: '#ff003c' },
        { x: 0.4, y: 0.8, w: 150, h: 80, vx: 0, vy: 0, type: 'DAMAGED BRIDGE', color: '#f59e0b' }
    ];

    function drawStaticNoise() {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            // Generate topographical shapes using sine waves mixed with noise
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            const topo = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01) * 50;
            
            data[i]     = v * 0.2 + topo;     // red
            data[i + 1] = v * 0.8 + topo;     // green
            data[i + 2] = v * 0.2;            // blue
            data[i + 3] = 255;                // alpha
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function drawTargets() {
        let activeTarget = null;

        targets.forEach(t => {
            // Update position
            t.x += t.vx;
            t.y += t.vy;
            
            // Bounce edges
            if(t.x < 0.1 || t.x > 0.9) t.vx *= -1;
            if(t.y < 0.1 || t.y > 0.9) t.vy *= -1;

            const px = t.x * width;
            const py = t.y * height;

            // Draw Box
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(px - t.w/2, py - t.h/2, t.w, t.h);

            // Draw Label
            ctx.fillStyle = t.color;
            ctx.font = '12px monospace';
            ctx.fillText(`ID-${Math.floor(Math.random()*999)}`, px - t.w/2, py - t.h/2 - 5);
            
            // Crosshair lock visual (if close to center)
            const distToCenter = Math.hypot(0.5 - t.x, 0.5 - t.y);
            if (distToCenter < 0.15) {
                activeTarget = t;
                ctx.beginPath();
                ctx.moveTo(px, py - 30);
                ctx.lineTo(px, py + 30);
                ctx.moveTo(px - 30, py);
                ctx.lineTo(px + 30, py);
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        });

        // Update UI Box
        if (activeTarget) {
            targetBox.style.display = 'block';
            targetClass.innerText = activeTarget.type;
            targetClass.style.color = activeTarget.color;
            targetConf.innerText = `CONFIDENCE: ${(92 + Math.random()*7).toFixed(1)}%`;
        } else {
            targetBox.style.display = 'none';
        }
    }

    function animate() {
        time += 0.05;
        
        // 1. Draw pseudo-thermal static background
        drawStaticNoise();

        // 2. Add scanline effect over canvas
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, (time * 50) % height, width, 10);

        // 3. Draw CV targets
        drawTargets();

        requestAnimationFrame(animate);
    }

    animate();
});
