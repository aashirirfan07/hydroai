/**
 * HydroSentinel Emergency Acoustic Siren & Bilingual Voice Broadcast Engine
 * =========================================================================
 * Generates realistic dual-tone acoustic disaster sirens using Web Audio API
 * and broadcasts spoken voice evacuation instructions in English & Hindi via Web Speech API.
 */

class EmergencySirenVoiceEngine {
    constructor() {
        this.audioCtx = null;
        this.oscCarrier = null;
        this.oscSub = null;
        this.gainNode = null;
        this.lfoNode = null;
        this.isPlaying = false;
        this.speechUtterance = null;
        this.activeLanguage = 'bilingual'; // 'bilingual', 'hi', 'en'
    }

    _initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    startSiren(durationSeconds = 6) {
        try {
            this._initAudio();
            if (this.isPlaying) this.stopSiren();

            const ctx = this.audioCtx;
            const now = ctx.currentTime;

            // Master gain
            this.gainNode = ctx.createGain();
            this.gainNode.gain.setValueAtTime(0.001, now);
            this.gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.8);

            // Primary Carrier Oscillator (Rising/Falling Siren Wail)
            this.oscCarrier = ctx.createOscillator();
            this.oscCarrier.type = 'sawtooth';
            this.oscCarrier.frequency.setValueAtTime(440, now);

            // LFO for periodic pitch oscillation
            this.lfoNode = ctx.createOscillator();
            this.lfoNode.frequency.setValueAtTime(0.4, now); // ~2.5 second sweep period
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(320, now); // Swing from 440 to 760 Hz

            this.lfoNode.connect(lfoGain);
            lfoGain.connect(this.oscCarrier.frequency);

            // Sub-harmonic oscillator for ominous rumble
            this.oscSub = ctx.createOscillator();
            this.oscSub.type = 'triangle';
            this.oscSub.frequency.setValueAtTime(110, now);

            // Connect graph
            this.oscCarrier.connect(this.gainNode);
            this.oscSub.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);

            this.oscCarrier.start(now);
            this.oscSub.start(now);
            this.lfoNode.start(now);
            this.isPlaying = true;

            // Optional auto-fade after duration
            if (durationSeconds > 0) {
                const stopTime = now + durationSeconds;
                this.gainNode.gain.setValueAtTime(0.18, stopTime - 0.8);
                this.gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
                setTimeout(() => {
                    if (this.isPlaying) this.stopSiren();
                }, durationSeconds * 1000);
            }

            this._updateUIBeacon(true);
        } catch (e) {
            console.warn('Emergency Siren initialization error:', e);
        }
    }

    stopSiren() {
        if (!this.isPlaying) return;
        try {
            if (this.gainNode && this.audioCtx) {
                this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
            }
            if (this.oscCarrier) {
                this.oscCarrier.stop(this.audioCtx.currentTime + 0.12);
                this.oscCarrier.disconnect();
            }
            if (this.oscSub) {
                this.oscSub.stop(this.audioCtx.currentTime + 0.12);
                this.oscSub.disconnect();
            }
            if (this.lfoNode) {
                this.lfoNode.stop(this.audioCtx.currentTime + 0.12);
                this.lfoNode.disconnect();
            }
            this.isPlaying = false;
            this._updateUIBeacon(false);
        } catch (e) {
            console.warn('Siren stop warning:', e);
        }
    }

    broadcastVoiceWarning(stationName = 'Kedarnath Mandakini Basin', lang = 'bilingual') {
        if (!('speechSynthesis' in window)) {
            console.warn('Web Speech API not supported in this browser.');
            return;
        }

        window.speechSynthesis.cancel(); // Clear queue

        const englishText = `Critical flash flood emergency warning for ${stationName}. Immediate evacuation to high ground safe zones required. Avoid river valleys and culverts.`;
        const hindiText = `सावधान! ${stationName} में अचानक बाढ़ और भूस्खलन की चेतावनी। सभी नागरिक तुरंत ऊंचे सुरक्षित स्थानों की ओर जाएं। नदी तट से दूर रहें।`;

        const speakText = (text, langCode, rate = 0.95) => {
            return new Promise((resolve) => {
                const utt = new SpeechSynthesisUtterance(text);
                utt.lang = langCode;
                utt.rate = rate;
                utt.pitch = 1.05;
                utt.volume = 1.0;
                
                // Select matching voice if available
                const voices = window.speechSynthesis.getVoices();
                if (langCode === 'hi-IN') {
                    const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('Hindi'));
                    if (hiVoice) utt.voice = hiVoice;
                }
                
                utt.onend = () => resolve();
                utt.onerror = () => resolve();
                window.speechSynthesis.speak(utt);
            });
        };

        const executeBroadcast = async () => {
            if (lang === 'en' || lang === 'bilingual') {
                await speakText(englishText, 'en-US', 0.95);
            }
            if (lang === 'hi' || lang === 'bilingual') {
                await speakText(hindiText, 'hi-IN', 0.9);
            }
        };

        executeBroadcast();
    }

    triggerFullEmergencyCycle(stationName = 'Kedarnath Mandakini Basin', lang = 'bilingual') {
        // Start siren wail for 4 seconds, then start voice announcement
        this.startSiren(4.5);
        setTimeout(() => {
            this.broadcastVoiceWarning(stationName, lang);
        }, 2200);
    }

    _updateUIBeacon(active) {
        const btns = document.querySelectorAll('.btn-siren-toggle, #btnCockpitSiren');
        btns.forEach(btn => {
            if (active) {
                btn.classList.add('siren-pulsing');
                btn.innerHTML = '🚨 <span class="badge-pulse-dot" style="background:#ef4444;"></span> SIREN ACTIVE';
            } else {
                btn.classList.remove('siren-pulsing');
                btn.innerHTML = '📢 Sound Voice Siren';
            }
        });
    }
}

window.emergencySirenEngine = new EmergencySirenVoiceEngine();

window.startEmergencySirenAndVoice = function(stn, lang) {
    window.emergencySirenEngine.triggerFullEmergencyCycle(stn, lang);
};

window.stopEmergencySiren = function() {
    window.emergencySirenEngine.stopSiren();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};
