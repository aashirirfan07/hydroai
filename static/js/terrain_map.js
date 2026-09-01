/* ==========================================================================
   3D TOPOGRAPHICAL TERRAIN & FLOOD RISK HEATMAP RENDERER (PLOTLY 3D)
   ========================================================================== */

let terrainMesh = null;

document.addEventListener('DOMContentLoaded', () => {
    init3DTerrain();
});

async function init3DTerrain() {
    const container = document.getElementById('topographical3DMap');
    if (!container) return;

    try {
        const res = await fetch('/api/terrain-mesh');
        terrainMesh = await res.json();
        render3DPlot(container, terrainMesh);
    } catch (err) {
        console.error("Failed to load 3D terrain mesh:", err);
    }
}

function render3DPlot(container, mesh) {
    const { x, y, z, risk_heat } = mesh;

    const data = [{
        type: 'surface',
        x: x,
        y: y,
        z: z,
        surfacecolor: risk_heat,
        colorscale: [
            [0.0, '#064e3b'],   // Deep green (Safe slope)
            [0.2, '#10b981'],   // Green
            [0.45, '#f59e0b'],  // Amber (Moderate runoff)
            [0.7, '#f97316'],   // Orange
            [0.88, '#ef4444'],  // Red (Severe inundation)
            [1.0, '#991b1b']    // Dark Crimson (Gorge convergence)
        ],
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#06b6d4",
                project: { z: false }
            }
        },
        lighting: {
            ambient: 0.65,
            diffuse: 0.75,
            specular: 0.4,
            roughness: 0.5
        },
        colorbar: {
            title: 'Risk Index',
            titleside: 'right',
            tickfont: { color: '#94a3b8', size: 9 },
            titlefont: { color: '#94a3b8', size: 10 },
            len: 0.6,
            thickness: 10,
            x: 0.95
        }
    }];

    const layout = {
        autosize: true,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: '#080c16',
        plot_bgcolor: '#080c16',
        scene: {
            xaxis: { visible: false, showgrid: false },
            yaxis: { visible: false, showgrid: false },
            zaxis: { visible: false, showgrid: false },
            camera: {
                eye: { x: 1.45, y: 1.45, z: 0.95 },
                center: { x: 0, y: 0, z: -0.1 }
            },
            aspectratio: { x: 1.2, y: 1.2, z: 0.6 }
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot(container, data, layout, config);
}

function reset3DView() {
    const container = document.getElementById('topographical3DMap');
    if (container) {
        Plotly.relayout(container, {
            'scene.camera.eye': { x: 1.45, y: 1.45, z: 0.95 },
            'scene.camera.center': { x: 0, y: 0, z: -0.1 }
        });
    }
}
