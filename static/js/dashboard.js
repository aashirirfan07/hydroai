/* ==========================================================================
   HYDROSENTINEL AI™ - DASHBOARD TELEMETRY & FULLY OPERATIONAL ALERT SENDER
   ========================================================================== */

let charts = {};
let pollInterval = null;
let audioCtx = null;
let sirenInterval = null;
let isSirenActive = false;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    startLivePolling();
    regenerateAlertMsg();
});

function initCharts() {
    const initData = window.INITIAL_TELEMETRY || {};
    const telemetry = initData.telemetry || {};
    const prediction = initData.prediction || {};
    const xai = prediction.xai_attribution || {};

    // 1. Satellite Radar Chart
    const ctxRadar = document.getElementById('satelliteRadarChart')?.getContext('2d');
    if (ctxRadar) {
        charts.radar = new Chart(ctxRadar, {
            type: 'line',
            data: {
                labels: ['-50m', '-40m', '-30m', '-20m', '-10m', 'Now'],
                datasets: [{
                    label: 'Rain Intensity (mm/hr)',
                    data: [
                        Math.max(5, telemetry.rainfall_intensity_mm_hr - 15),
                        Math.max(10, telemetry.rainfall_intensity_mm_hr - 8),
                        Math.max(8, telemetry.rainfall_intensity_mm_hr - 12),
                        telemetry.rainfall_intensity_mm_hr + 4,
                        telemetry.rainfall_intensity_mm_hr - 2,
                        telemetry.rainfall_intensity_mm_hr
                    ],
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.22)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.2,
                    pointRadius: 2
                }]
            },
            options: getMiniChartOptions(0, 150)
        });
    }

    // 2. IoT Soil Saturation Multi-layer Bar Chart
    const ctxSoil = document.getElementById('soilMoistureChart')?.getContext('2d');
    if (ctxSoil) {
        const layers = telemetry.soil_layers || [
            { layer: 'Topsoil', value: 85 },
            { layer: 'Subsoil', value: 78 },
            { layer: 'Bedrock', value: 68 },
            { layer: 'Aquifer', value: 60 }
        ];
        charts.soil = new Chart(ctxSoil, {
            type: 'bar',
            data: {
                labels: layers.map(l => l.layer.split(' ')[0]),
                datasets: [{
                    label: 'Saturation %',
                    data: layers.map(l => l.value),
                    backgroundColor: '#ffb703',
                    borderRadius: 4
                }]
            },
            options: getMiniChartOptions(0, 100)
        });
    }

    // 3. River Gauges Stage Curve
    const ctxRiver = document.getElementById('riverGaugesChart')?.getContext('2d');
    if (ctxRiver) {
        charts.river = new Chart(ctxRiver, {
            type: 'line',
            data: {
                labels: Array.from({ length: 13 }, (_, i) => `${i * 10}m`),
                datasets: [{
                    label: 'Stage Height (m)',
                    data: telemetry.river_history || [1.2, 1.4, 1.8, 2.2, 2.8, 3.4, 3.8, 4.1, 4.5, 4.8, 5.0, 5.2, telemetry.river_water_level_m],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 1
                }]
            },
            options: getMiniChartOptions(0, 8)
        });
    }

    // 4. Slope Gradient Profile
    const ctxSlope = document.getElementById('slopeGradientChart')?.getContext('2d');
    if (ctxSlope) {
        charts.slope = new Chart(ctxSlope, {
            type: 'line',
            data: {
                labels: ['0km', '2km', '4km', '6km', '8km', '10km'],
                datasets: [{
                    label: 'Elevation (m)',
                    data: [1850, 1720, 1580, 1420, 1260, 1050],
                    borderColor: '#05ffa1',
                    backgroundColor: 'rgba(5, 255, 161, 0.2)',
                    fill: true,
                    tension: 0.25,
                    borderWidth: 2,
                    pointRadius: 2
                }]
            },
            options: getMiniChartOptions(800, 2000)
        });
    }

    // 5. AI 24-Hour Flood Probability Forecast
    const ctxProb = document.getElementById('floodProbabilityChart')?.getContext('2d');
    if (ctxProb) {
        charts.prob = new Chart(ctxProb, {
            type: 'line',
            data: {
                labels: prediction.forecast_timeline_hours || ['0h', '4h', '8h', '12h', '16h', '20h', '24h'],
                datasets: [{
                    label: 'Probability %',
                    data: prediction.forecast_probability_curve || [40, 55, 72, 88, 92, 85, 68],
                    borderColor: prediction.color || '#ffb703',
                    backgroundColor: `${prediction.color || '#ffb703'}22`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 3
                }]
            },
            options: getMiniChartOptions(0, 100)
        });
    }

    // 6. Rainfall Accumulation
    const ctxCumRain = document.getElementById('rainfallAccumulationChart')?.getContext('2d');
    if (ctxCumRain) {
        charts.cumRain = new Chart(ctxCumRain, {
            type: 'line',
            data: {
                labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'],
                datasets: [{
                    label: 'Precipitation (mm)',
                    data: [10, 35, 75, 120, 175, 230, 290],
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    fill: true,
                    stepped: true,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: getMiniChartOptions(0, 350)
        });
    }

    // 7. XAI Feature Attribution Radar Chart
    const ctxXai = document.getElementById('xaiRadarChart')?.getContext('2d');
    if (ctxXai) {
        charts.xai = new Chart(ctxXai, {
            type: 'radar',
            data: {
                labels: ['Precipitation Radar', 'Soil Saturation', 'River Stage & Velocity', 'Topographic Slope', 'Catchment Inflow'],
                datasets: [{
                    label: 'Factor Severity %',
                    data: [
                        xai.meteorological_rainfall_pct || 32,
                        xai.soil_saturation_pressure_pct || 24,
                        xai.river_stage_and_velocity_pct || 28,
                        xai.topographic_slope_gradient_pct || 18,
                        xai.upstream_surge_rate_pct || 14
                    ],
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.28)',
                    borderWidth: 2.2,
                    pointBackgroundColor: '#00f0ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
                        grid: { color: 'rgba(255, 255, 255, 0.12)' },
                        pointLabels: { color: '#94a3b8', font: { size: 11, weight: 'bold' } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }
}

function getMiniChartOptions(minVal, maxVal) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#030712',
                borderColor: '#00f0ff',
                borderWidth: 1,
                titleFont: { size: 10 },
                bodyFont: { size: 11 }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
            y: {
                min: minVal,
                max: maxVal,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 4 }
            }
        }
    };
}

function startLivePolling() {
    if (pollInterval) clearInterval(pollInterval);
    
    pollInterval = setInterval(async () => {
        try {
            const station = document.getElementById('stationSelect')?.value || 'STN-AL-02';
            const mode = document.getElementById('streamModeSelect')?.value || 'stream';
            const response = await fetch(`/api/live-telemetry?station=${station}&mode=${mode}`);
            if (!response.ok) return;
            const data = await response.json();
            updateDashboardUI(data);
            if (window.update3DFromLiveTelemetry) {
                window.update3DFromLiveTelemetry(data.telemetry, data.prediction);
            }
        } catch (err) {
            console.error("HydroSentinel streaming error:", err);
        }
    }, 3500);
}

function updateDashboardUI(data) {
    const { telemetry, prediction, timestamp } = data;
    const xai = prediction.xai_attribution || {};

    const timeEl = document.getElementById('lastUpdatedTime');
    if (timeEl) timeEl.innerText = timestamp;

    const rainEl = document.getElementById('valRainfall');
    if (rainEl) rainEl.innerText = `${telemetry.rainfall_intensity_mm_hr} mm/hr`;

    const soilEl = document.getElementById('valSoilMoisture');
    if (soilEl) soilEl.innerText = `${telemetry.soil_moisture_percentage}%`;

    const riverEl = document.getElementById('valRiverLevel');
    if (riverEl) riverEl.innerText = `${telemetry.river_water_level_m} m`;

    const slopeEl = document.getElementById('valSlope');
    if (slopeEl) slopeEl.innerText = `${telemetry.slope_gradient_deg}° (${telemetry.elevation_m}m)`;

    const velEl = document.getElementById('valVelocity');
    if (velEl) velEl.innerText = `${telemetry.river_flow_velocity_mps} m/s`;

    const surgeEl = document.getElementById('valSurge');
    if (surgeEl) surgeEl.innerText = `${telemetry.upstream_basin_surge_rate} m³/s²`;

    const probEl = document.getElementById('valProbability');
    if (probEl) probEl.innerText = `${prediction.flood_probability_24h}%`;

    const cumRainEl = document.getElementById('valCumRain');
    if (cumRainEl) cumRainEl.innerText = `${telemetry.cumulative_rainfall_24h_mm} mm`;

    const threatCodeEl = document.getElementById('valThreatCode');
    if (threatCodeEl) threatCodeEl.innerText = prediction.threat_level;

    // Circular Gauge
    const gaugeValueText = document.getElementById('gaugeValueText');
    if (gaugeValueText) gaugeValueText.innerText = prediction.flood_risk_score;

    const gaugeArc = document.getElementById('gaugeArcFilled');
    if (gaugeArc) {
        gaugeArc.setAttribute('stroke', prediction.color);
        const ratio = Math.min(1.0, prediction.flood_risk_score / 1200.0);
        gaugeArc.style.strokeDashoffset = 188.4 * (1 - ratio);
    }

    const riskBadge = document.getElementById('riskBadge');
    if (riskBadge) {
        riskBadge.innerText = prediction.alert_level;
        riskBadge.style.backgroundColor = prediction.color;
    }

    const alertBanner = document.getElementById('alertBannerText');
    if (alertBanner) alertBanner.innerText = prediction.alert_status;

    // Update XAI Factors
    const xRain = document.getElementById('xaiRainPct');
    const xRainB = document.getElementById('xaiRainBar');
    if (xRain && xai.meteorological_rainfall_pct) {
        xRain.innerText = `${xai.meteorological_rainfall_pct}%`;
        xRainB.style.width = `${xai.meteorological_rainfall_pct}%`;
    }

    // Update Chart Datasets
    if (charts.radar) {
        const d = charts.radar.data.datasets[0].data;
        d.shift();
        d.push(telemetry.rainfall_intensity_mm_hr);
        charts.radar.update('none');
    }
    if (charts.soil && telemetry.soil_layers) {
        charts.soil.data.datasets[0].data = telemetry.soil_layers.map(l => l.value);
        charts.soil.update('none');
    }
    if (charts.river && telemetry.river_history) {
        charts.river.data.datasets[0].data = telemetry.river_history;
        charts.river.update('none');
    }
    if (charts.prob && prediction.forecast_probability_curve) {
        charts.prob.data.datasets[0].data = prediction.forecast_probability_curve;
        charts.prob.data.datasets[0].borderColor = prediction.color;
        charts.prob.data.datasets[0].backgroundColor = `${prediction.color}22`;
        charts.prob.update('none');
    }
}

function switchStation(stationId) {
    window.location.href = `/dashboard?station=${stationId}`;
}

function switchTelemetryMode(mode) {
    const station = document.getElementById('stationSelect')?.value || 'STN-AL-02';
    fetch(`/api/live-telemetry?station=${station}&mode=${mode}`)
        .then(res => res.json())
        .then(data => updateDashboardUI(data))
        .catch(err => console.error(err));
}

function switchDashboardTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }

    event.currentTarget.classList.add('active');
}

// ================= FULLY OPERATIONAL ALERT SENDER CONTROLLER ================= //
function addPreset(type, value) {
    if (type === 'phone') {
        const input = document.getElementById('alertPhones');
        if (input) {
            const current = input.value.trim();
            if (!current.includes(value)) {
                input.value = current ? `${current}, ${value}` : value;
            }
        }
    } else if (type === 'email') {
        const input = document.getElementById('alertEmails');
        if (input) {
            const current = input.value.trim();
            if (!current.includes(value)) {
                input.value = current ? `${current}, ${value}` : value;
            }
        }
    }
}

function regenerateAlertMsg() {
    const stnSelect = document.getElementById('stationSelect');
    const stnName = stnSelect ? stnSelect.options[stnSelect.selectedIndex].text : 'Alaknanda Upper Gorge';
    const riskScore = document.getElementById('gaugeValueText')?.innerText || '980';
    const prob = document.getElementById('valProbability')?.innerText || '92%';
    const rain = document.getElementById('valRainfall')?.innerText || '74 mm/hr';

    const msg = `[CRITICAL FLASH FLOOD WARNING] HydroSentinel AI Alert for ${stnName}. Current Severity: ${riskScore}/1200 (24h Peak Probability: ${prob}, Rainfall Inflow: ${rain}). Immediate high-ground evacuation to designated safe zones required.`;
    const textarea = document.getElementById('alertCustomMsg');
    if (textarea) textarea.value = msg;
}

function submitAlertDispatch(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitDispatch');
    const resultBox = document.getElementById('dispatchReceiptsResult');
    const station = document.getElementById('stationSelect')?.value || 'STN-AL-02';
    const phones = document.getElementById('alertPhones')?.value || '';
    const emails = document.getElementById('alertEmails')?.value || '';
    const msg = document.getElementById('alertCustomMsg')?.value || '';

    btn.disabled = true;
    btn.innerHTML = 'Transmitting SMS & Email Relays...';
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="alert-box alert-box-info">Transmitting Cellular SMS & SMTP payloads across emergency gateways...</div>';

    fetch('/api/send-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            station: station,
            phone_numbers: phones,
            emails: emails,
            message: msg,
            severity: 'CRITICAL EVACUATION'
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = 'Transmit SMS & Email Alerts';

        if (data.status === 'success') {
            let receiptsHtml = `
                <div class="alert-box alert-box-success mb-3">
                    <div>
                        <strong>DISPATCH SUCCESSFUL:</strong> ${data.message} (${data.timestamp})
                    </div>
                </div>
                <div class="gateway-status-list">
            `;

            data.receipts.forEach(r => {
                const icon = r.channel === 'SMS_GATEWAY' ? 'fa-mobile-screen text-amber' : 'fa-envelope text-cyan';
                receiptsHtml += `
                    <div class="gateway-item">
                        <div class="gw-left">
                            <div>
                                <strong>${r.recipient}</strong>
                                <small>ID: ${r.msg_id} | Relay Latency: ${r.carrier_latency}</small>
                            </div>
                        </div>
                        <span class="badge badge-success">${r.status}</span>
                    </div>
                `;
            });

            receiptsHtml += '</div>';
            resultBox.innerHTML = receiptsHtml;

            // Trigger Browser Notification
            triggerBrowserNativeNotification();
        } else {
            resultBox.innerHTML = `<div class="alert-box alert-box-danger">Error: ${data.message}</div>`;
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerHTML = 'Transmit SMS & Email Alerts';
        resultBox.innerHTML = `<div class="alert-box alert-box-danger">Network error: ${err}</div>`;
    });
}

function sendViaWhatsApp() {
    const msg = document.getElementById('alertCustomMsg')?.value || 'Flash Flood Alert';
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

function triggerBrowserNativeNotification() {
    if (!("Notification" in window)) {
        alert("Desktop notifications not supported in this browser.");
        return;
    }

    const title = "⚠️ HydroSentinel AI: Critical Flash Flood Warning";
    const body = document.getElementById('alertCustomMsg')?.value || "Immediate high ground evacuation required.";

    if (Notification.permission === "granted") {
        new Notification(title, { body: body, icon: "/static/img/dashboard_mockup.jpg" });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: body, icon: "/static/img/dashboard_mockup.jpg" });
            }
        });
    }
}

// Web Audio API Siren Synthesizer
function toggleEmergencySiren() {
    isSirenActive = !isSirenActive;
    const btn = document.getElementById('sirenAudioToggleBtn');
    const txt = document.getElementById('sirenBtnText');

    if (isSirenActive) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        btn.classList.add('btn-alert');
        txt.innerText = "Mute Siren";
        playSirenTone();
    } else {
        txt.innerText = "Acoustic Siren";
        btn.classList.remove('btn-alert');
        stopSirenTone();
    }
}

let osc = null;
function playSirenTone() {
    if (!audioCtx) return;
    osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.0);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    sirenInterval = setInterval(() => {
        if (osc) {
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.8);
        }
    }, 1000);
}

function stopSirenTone() {
    if (sirenInterval) clearInterval(sirenInterval);
    if (osc) {
        try { osc.stop(); } catch(e){}
        osc = null;
    }
}


// ================= PHONE & EMAIL ALERT SENDER CONTROLLER ================= //
function openAlertModal() {
    const modal = document.getElementById('alertSenderModal');
    if (modal) {
        modal.style.display = 'flex';
        regenerateAlertMsg();
    }
}

function closeAlertModal() {
    const modal = document.getElementById('alertSenderModal');
    if (modal) modal.style.display = 'none';
}

function addPreset(type, value) {
    if (type === 'phone') {
        const input = document.getElementById('alertPhones');
        if (input) {
            const current = input.value.trim();
            if (!current.includes(value)) {
                input.value = current ? `${current}, ${value}` : value;
            }
        }
    } else if (type === 'email') {
        const input = document.getElementById('alertEmails');
        if (input) {
            const current = input.value.trim();
            if (!current.includes(value)) {
                input.value = current ? `${current}, ${value}` : value;
            }
        }
    }
}

function regenerateAlertMsg() {
    const stnSelect = document.getElementById('stationSelect');
    const stnName = stnSelect ? stnSelect.options[stnSelect.selectedIndex].text : 'Regional Catchment';
    const riskScore = document.getElementById('gaugeValueText')?.innerText || '750';
    const prob = document.getElementById('valProbability')?.innerText || '82%';
    const rain = document.getElementById('valRainfall')?.innerText || '45 mm/hr';

    const msg = `[CRITICAL FLASH FLOOD WARNING] HydroSentinel AI Alert for ${stnName}. Current Severity: ${riskScore}/1200 (24h Probability: ${prob}, Inflow: ${rain}). Immediate high-ground evacuation to designated safe zones required.`;
    const textarea = document.getElementById('alertCustomMsg');
    if (textarea) textarea.value = msg;
}

function submitAlertDispatch(event) {
    event.preventDefault();
    const btn = document.getElementById('btnSubmitDispatch');
    const resultBox = document.getElementById('dispatchReceiptsResult');
    const station = document.getElementById('stationSelect')?.value || 'STN-AL-02';
    const phones = document.getElementById('alertPhones')?.value || '';
    const emails = document.getElementById('alertEmails')?.value || '';
    const msg = document.getElementById('alertCustomMsg')?.value || '';

    btn.disabled = true;
    btn.innerHTML = 'Transmitting SMS & Email Relays...';
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="alert-box alert-box-info">Transmitting cellular SMS & SMTP payloads...</div>';

    fetch('/api/send-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            station: station,
            phone_numbers: phones,
            emails: emails,
            message: msg,
            severity: 'CRITICAL EVACUATION'
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = 'Transmit SMS & Email Alerts Now';

        if (data.status === 'success') {
            let receiptsHtml = `
                <div class="alert-box alert-box-success mb-3">
                    <div>
                        <strong>SUCCESS:</strong> ${data.message} (${data.timestamp})
                    </div>
                </div>
                <div class="receipts-list">
            `;

            data.receipts.forEach(r => {
                const icon = r.channel === 'SMS_GATEWAY' ? 'fa-mobile-screen text-amber' : 'fa-envelope text-cyan';
                receiptsHtml += `
                    <div class="receipt-row">
                        <div class="receipt-target">
                            <span>${r.recipient}</span>
                        </div>
                        <span class="badge badge-success">${r.status} (${r.carrier_latency})</span>
                        <code class="receipt-id">${r.msg_id}</code>
                    </div>
                `;
            });

            receiptsHtml += '</div>';
            resultBox.innerHTML = receiptsHtml;
        } else {
            resultBox.innerHTML = `<div class="alert-box alert-box-danger">Error: ${data.message}</div>`;
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerHTML = 'Transmit SMS & Email Alerts Now';
        resultBox.innerHTML = `<div class="alert-box alert-box-danger">Network transmission error: ${err}</div>`;
    });
}


/* ==========================================================================
   HYDROSENTINEL AI™ - ADVANCED AUDIO SYNTHESIS & VOICE DISPATCH
   ========================================================================== */

let audioCtx = null;
let sirenOscillator = null;
let sirenGain = null;
let isSirenActive = false;
let isVoiceMuted = false;

function initAudioSystem() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
}

function toggleEmergencySiren() {
    initAudioSystem();
    const btn = document.getElementById('sirenAudioToggleBtn');
    const btnText = document.getElementById('sirenBtnText');

    if (!isSirenActive) {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        sirenOscillator = audioCtx.createOscillator();
        sirenGain = audioCtx.createGain();

        sirenOscillator.type = 'sawtooth';
        sirenOscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

        // LFO for acoustic sweep
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.6, audioCtx.currentTime);

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(260, audioCtx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(sirenOscillator.frequency);

        sirenGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        sirenOscillator.connect(sirenGain);
        sirenGain.connect(audioCtx.destination);

        sirenOscillator.start();
        lfo.start();

        isSirenActive = true;
        if (btn) btn.classList.add('siren-playing');
        if (btnText) btnText.textContent = 'Mute Siren';

        // Announce voice alert
        speakEmergencyAnnouncement("Warning. Flash flood surge advisory active. River stage breaching threshold.");
    } else {
        if (sirenOscillator) {
            sirenOscillator.stop();
            sirenOscillator.disconnect();
        }
        isSirenActive = false;
        if (btn) btn.classList.remove('siren-playing');
        if (btnText) btnText.textContent = 'Siren';
    }
}

function speakEmergencyAnnouncement(text) {
    if (isVoiceMuted) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

/* Keyboard Shortcuts */
document.addEventListener('keydown', (e) => {
    // Space to toggle siren when not in text input
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        toggleEmergencySiren();
    }
    // Alt + Numbers 1-7 for navigation
    if (e.altKey && e.key >= '1' && e.key <= '7') {
        const routes = ['/', '/dashboard', '/analytics', '/early-warning', '/predict', '/models', '/about'];
        const target = routes[parseInt(e.key) - 1];
        if (target) window.location.href = target;
    }
});
