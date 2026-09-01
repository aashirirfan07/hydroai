
/* ==========================================================================
   🌐 MULTI-LANGUAGE REGIONAL DISASTER LOCALIZATION (EN / HI / ML)
   - English, Hindi (हिंदी - Uttarakhand / Himachal), Malayalam (മലയാളം - Kerala / Wayanad)
   - Instant Client-Side Translation & Native Multilingual Voice Copilot
   ========================================================================== */

const I18N_DICTIONARY = {
    'en': {
        'nav_overview': 'Overview',
        'nav_3dtwin': '3D Twin',
        'nav_sos': 'Citizen SOS',
        'nav_damage': 'Damage Scan',
        'nav_analytics': 'Analytics',
        'nav_alerts': 'Early Warning',
        'nav_simulator': 'Simulator',
        'nav_time': 'Time-Machine',
        'nav_satellites': 'Satellites',
        'nav_models': 'Model Hub',
        'nav_briefing': 'NDMA SITREP',
        'hero_title': 'Autonomous Flash Flood Defense & Early Warning',
        'hero_tag': 'AUTONOMOUS GEOSPATIAL INTELLIGENCE • v4.2 SPATIAL',
        'btn_launch_3d': 'Launch 3D Digital Twin',
        'btn_damage_scan': 'Satellite Damage Scan',
        'btn_sos_beacon': 'Emergency 1-Tap SOS Beacon',
        'lbl_critical_surge': 'Critical Surge',
        'lbl_advisory': 'Advisory',
        'lbl_normal': 'Normal',
        'lbl_precip': 'Precipitation',
        'lbl_stage': 'River Stage',
        'lbl_soil': 'Soil Saturation',
        'lbl_flow': 'Flow Velocity',
        'lbl_lead_time': 'Warning Lead Time',
        'lbl_safe_zones': 'High-Altitude Safe Zones',
        'lbl_pilot_drone': '🎮 Pilot Drone (WASD)',
        'lbl_run_evac': '🏃 Run Evac Sim',
        'lbl_atmo_storm': '⛈️ Cloudburst Storm',
        'lbl_atmo_clear': '☀️ Calm Sunlit',
        'lbl_atmo_thermal': '🎯 FLIR Thermal',
        'lbl_atmo_surge': '🚨 Critical Inundation'
    },
    'hi': {
        'nav_overview': 'अवलोकन (होम)',
        'nav_3dtwin': '3D डिजिटल ट्विन',
        'nav_sos': 'नागरिक SOS',
        'nav_damage': 'बाढ़ क्षति स्कैन',
        'nav_analytics': 'डेटा विश्लेषण',
        'nav_alerts': 'आपातकालीन चेतावनी',
        'nav_simulator': 'सिम्युलेटर',
        'nav_time': 'टाइम-मशीन',
        'nav_satellites': 'उपग्रह ट्रैकर',
        'nav_models': 'AI मॉडल हब',
        'nav_briefing': 'NDMA रिपोर्ट',
        'hero_title': 'पहाड़ी घाटियों के लिए स्वायत्त फ्लैश फ्लड पूर्व चेतावनी',
        'hero_tag': 'स्वायत्त भू-स्थानिक खुफिया • v4.2 स्थानिक',
        'btn_launch_3d': '3D डिजिटल ट्विन शुरू करें',
        'btn_damage_scan': 'उपग्रह बाढ़ क्षति स्कैन',
        'btn_sos_beacon': '🚨 आपातकालीन 1-टैप SOS बटन',
        'lbl_critical_surge': '🔴 अत्यधिक गंभीर खतरा',
        'lbl_advisory': '🟡 चेतावनी सलाह',
        'lbl_normal': '🟢 सामान्य स्थिति',
        'lbl_precip': 'वर्षा की तीव्रता',
        'lbl_stage': 'नदी का जलस्तर',
        'lbl_soil': 'मिट्टी की नमी (संतृप्ति)',
        'lbl_flow': 'जल प्रवाह का वेग',
        'lbl_lead_time': 'निकासी का समय शेष',
        'lbl_safe_zones': 'सुरक्षित ऊंचाई वाले आश्रय स्थल',
        'lbl_pilot_drone': '🎮 3D ड्रोन पायलट करें',
        'lbl_run_evac': '🏃 निकासी सिमुलेशन चलाएं',
        'lbl_atmo_storm': '⛈️ बादल फटना (तूफान)',
        'lbl_atmo_clear': '☀️ शांत धूप',
        'lbl_atmo_thermal': '🎯 नाइट विजन (थर्मल)',
        'lbl_atmo_surge': '🚨 गंभीर बाढ़ जलस्तर'
    },
    'ml': {
        'nav_overview': 'ഹോം (അവലോകനം)',
        'nav_3dtwin': '3D ഡിജിറ്റൽ ട്വിൻ',
        'nav_sos': 'സിറ്റിസൺ SOS',
        'nav_damage': 'പ്രളയ നാശനഷ്ടം',
        'nav_analytics': 'ഡാറ്റ അനലിറ്റിക്സ്',
        'nav_alerts': 'അടിയന്തര മുന്നറിയിപ്പ്',
        'nav_simulator': 'സിമുലേറ്റർ',
        'nav_time': 'ടൈം മെഷീൻ',
        'nav_satellites': 'ഉപഗ്രഹ റഡാർ',
        'nav_models': 'AI മോഡൽ ഹബ്',
        'nav_briefing': 'NDMA റിപ്പോർട്ട്',
        'hero_title': 'തീവ്ര പ്രളയ മുന്നറിയിപ്പും ദുരന്ത നിവാരണ പ്രതിരോധവും',
        'hero_tag': 'ഭൂപ്രദേശ ഇന്റലിജൻസ് • v4.2 സ്പേഷ്യൽ',
        'btn_launch_3d': '3D ട്വിൻ തുറക്കുക',
        'btn_damage_scan': 'ഉപഗ്രഹ പരിശോധന',
        'btn_sos_beacon': '🚨 അടിയന്തര 1-ടാപ്പ് SOS',
        'lbl_critical_surge': '🔴 അതിതീവ്ര പ്രളയസാധ്യത',
        'lbl_advisory': '🟡 ജാഗ്രതാ നിർദ്ദേശം',
        'lbl_normal': '🟢 സാധാരണ നില',
        'lbl_precip': 'മഴയുടെ തീവ്രത',
        'lbl_stage': 'നദിയിലെ ജലനിരപ്പ്',
        'lbl_soil': 'മണ്ണിലെ ഈർപ്പത്തിന്റെ അളവ്',
        'lbl_flow': 'വെള്ളത്തിന്റെ ഒഴുക്ക് വേഗത',
        'lbl_lead_time': 'മുന്നറിയിപ്പ് സമയം',
        'lbl_safe_zones': 'സുരക്ഷിത സ്ഥാനങ്ങൾ (ക്യാമ്പുകൾ)',
        'lbl_pilot_drone': '🎮 3D ഡ്രോൺ പറത്തുക',
        'lbl_run_evac': '🏃 രക്ഷാപ്രവർത്തന സിമുലേഷൻ',
        'lbl_atmo_storm': '⛈️ അതിതീവ്ര മഴ (മേഘവിസ്ഫോടനം)',
        'lbl_atmo_clear': '☀️ തെളിഞ്ഞ കാലാവസ്ഥ',
        'lbl_atmo_thermal': '🎯 തെർമൽ നൈറ്റ് വിഷൻ',
        'lbl_atmo_surge': '🚨 അടിയന്തര പ്രളയ മുന്നറിയിപ്പ്'
    }
};

let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
    initLanguageEngine();
});

function initLanguageEngine() {
    const saved = localStorage.getItem('hydro_lang') || 'en';
    setLanguage(saved, false);
}

function setLanguage(lang, save = true) {
    if (!I18N_DICTIONARY[lang]) lang = 'en';
    currentLanguage = lang;
    if (save) localStorage.setItem('hydro_lang', lang);

    // Update active pill button
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Apply translations to all elements with data-i18n attribute
    const dict = I18N_DICTIONARY[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    // Update Copilot Voice Language
    if (typeof synth !== 'undefined') {
        const voiceLangs = { 'en': 'en-US', 'hi': 'hi-IN', 'ml': 'ml-IN' };
        window.currentSpeechLang = voiceLangs[lang] || 'en-US';
    }

    console.log(`HydroSentinel Language switched to: ${lang.toUpperCase()}`);
}
