
document.addEventListener('DOMContentLoaded', () => {
    const knobs = document.querySelectorAll('.tactile-knob-container');
    
    knobs.forEach(knob => {
        const dial = knob.querySelector('.tactile-knob-dial');
        const minVal = parseFloat(knob.getAttribute('data-min'));
        const maxVal = parseFloat(knob.getAttribute('data-max'));
        const isRain = knob.id === 'knobRain';
        
        let isDragging = false;
        
        // Angles: -135deg (min) to +135deg (max)
        const minAngle = -135;
        const maxAngle = 135;
        const angleRange = maxAngle - minAngle;
        
        // Initialize position
        const initVal = parseFloat(knob.getAttribute('data-val'));
        setKnobValue(initVal);
        
        function updateKnobAngle(e) {
            if (!isDragging) return;
            
            const rect = knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Handle touch or mouse
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const dx = clientX - centerX;
            const dy = clientY - centerY;
            
            // Calculate angle in degrees
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Offset because 0 degrees is right (3 o'clock). We want top (12 o'clock) to be 0.
            angle += 90;
            
            // Normalize angle for bottom dead zone
            if (angle > 180) angle -= 360;
            if (angle < -180) angle += 360;
            
            // Clamp angle to valid range
            if (angle < minAngle && angle > -180) angle = minAngle; // bottom left
            if (angle > maxAngle || (angle < -180 && angle > minAngle)) angle = maxAngle; // bottom right
            
            // Map angle to value
            const progress = (angle - minAngle) / angleRange;
            const value = minVal + progress * (maxVal - minVal);
            
            setKnobValue(value);
        }
        
        function setKnobValue(value) {
            // Clamp value
            const clamped = Math.max(minVal, Math.min(maxVal, value));
            
            // Map to angle
            const progress = (clamped - minVal) / (maxVal - minVal);
            const angle = minAngle + progress * angleRange;
            
            dial.style.transform = `rotate(${angle}deg)`;
            
            // Update UI readout and trigger callbacks
            if (isRain) {
                const valInt = Math.round(clamped);
                document.getElementById('rainIntensityText').innerText = valInt;
                if (typeof setRainIntensity === 'function') setRainIntensity(valInt);
            } else {
                const valFloat = clamped.toFixed(1);
                document.getElementById('floodLevelText').innerText = valFloat;
                if (typeof onFloodSliderChange === 'function') onFloodSliderChange(valFloat);
            }
        }
        
        // Event Listeners
        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            dial.classList.add('dragging');
            updateKnobAngle(e);
        });
        
        knob.addEventListener('touchstart', (e) => {
            isDragging = true;
            dial.classList.add('dragging');
            updateKnobAngle(e);
        }, {passive: false});
        
        document.addEventListener('mousemove', updateKnobAngle);
        document.addEventListener('touchmove', (e) => {
            if (isDragging) e.preventDefault(); // prevent scroll
            updateKnobAngle(e);
        }, {passive: false});
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            dial.classList.remove('dragging');
        });
        document.addEventListener('touchend', () => {
            isDragging = false;
            dial.classList.remove('dragging');
        });
    });
});
