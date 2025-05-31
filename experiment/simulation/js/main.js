// Global state
let state = {
    currentStep: 0,
    isRunning: false,
    noiseSourceEnabled: false,
    inputLevel: -10, // dBm
    amplitude: 1.0, // V
    frequency: 1000,
    temperature: 290,
    gain: 20,
    isVoiceEnabled: true,
    language: 'en',
    measurements: {
        noisePowerHot: 0,
        noisePowerCold: 0,
        yFactor: 0,
        noiseFigure: 0,
        outputPower: 0
    },
    dragOffset: { x: 0, y: 0 },
    isDragging: false
};

// Steps definition with translations
const steps = {
    en: [
        {
            title: "Setup Signal Generator",
            description: "Configure input signal level and frequency",
            instruction: "Set the signal generator to desired frequency and power level. This will be our reference signal for noise measurements."
        },
        {
            title: "Calibrate Cold Measurement",
            description: "Measure noise with noise source OFF",
            instruction: "Turn off the noise source and measure the cold noise power. This represents the amplifier's internal noise plus ambient noise."
        },
        {
            title: "Enable Hot Noise Source",
            description: "Turn ON the noise source for hot measurement",
            instruction: "Enable the noise source to add excess noise. This creates the 'hot' condition for Y-factor measurement."
        },
        {
            title: "Measure Hot Noise Power",
            description: "Record noise power with noise source ON",
            instruction: "Measure the total noise power including the excess noise from the noise source. This is the 'hot' measurement."
        },
        {
            title: "Calculate Noise Figure",
            description: "Compute NF using Y-factor method",
            instruction: "The noise figure is calculated using NF = ENR - 10×log₁₀(Y-1), where Y is the ratio of hot to cold noise power."
        }
    ],
    hi: [
        {
            title: "सिग्नल जेनरेटर सेटअप",
            description: "इनपुट सिग्नल स्तर और आवृत्ति कॉन्फ़िगर करें",
            instruction: "सिग्नल जेनरेटर को वांछित आवृत्ति और पावर स्तर पर सेट करें। यह शोर माप के लिए हमारा संदर्भ सिग्नल होगा।"
        },
        {
            title: "कोल्ड मापन कैलिब्रेट करें",
            description: "शोर स्रोत बंद के साथ शोर मापें",
            instruction: "शोर स्रोत को बंद करें और कोल्ड शोर पावर को मापें। यह एम्पलीफायर के आंतरिक शोर और परिवेशी शोर का प्रतिनिधित्व करता है।"
        },
        {
            title: "हॉट नॉइज़ सोर्स सक्षम करें",
            description: "हॉट मापन के लिए शोर स्रोत चालू करें",
            instruction: "अतिरिक्त शोर जोड़ने के लिए शोर स्रोत को सक्षम करें। यह Y-फैक्टर मापन के लिए 'हॉट' स्थिति बनाता है।"
        },
        {
            title: "हॉट नॉइज़ पावर मापें",
            description: "शोर स्रोत चालू के साथ शोर पावर रिकॉर्ड करें",
            instruction: "शोर स्रोत से अतिरिक्त शोर सहित कुल शोर पावर को मापें। यह 'हॉट' मापन है।"
        },
        {
            title: "नॉइज़ फिगर की गणना करें",
            description: "Y-फैक्टर विधि का उपयोग करके NF की गणना करें",
            instruction: "शोर आंकड़ा NF = ENR - 10×log₁₀(Y-1) का उपयोग करके गणना की जाती है, जहाँ Y हॉट से कोल्ड शोर पावर का अनुपात है।"
        }
    ]
};

// Animation variables
let animationTime = 0;
let animationId = null;

// Voice synthesis
function speak(text) {
    if (!state.isVoiceEnabled) return;
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.lang = state.language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

function stopSpeaking() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// RF Calculations
function calculateNoiseFigure() {
    const kB = 1.38e-23; // Boltzmann constant (J/K)
    const ENR = 15.0; // Excess Noise Ratio in dB
    const bandwidth = 1e6; // 1 MHz bandwidth

    // Calculate thermal noise power at temperature in Watts
    const thermalNoisePowerWatts = kB * state.temperature * bandwidth;
    
    // Convert to dBm: P(dBm) = 10*log10(P_watts * 1000)
    const thermalNoisePowerdBm = 10 * Math.log10(thermalNoisePowerWatts * 1000);

    // Amplifier noise figure (frequency dependent) in dB
    const intrinsicNFdB = 1.5 + 0.3 * Math.log10(state.frequency / 1000);
    
    // Calculate cold noise power including amplifier noise in dBm
    // Cold noise = thermal noise + amplifier internal noise
    const coldNoisePowerdBm = thermalNoisePowerdBm + intrinsicNFdB + state.gain;

    // Calculate hot noise power
    let hotNoisePowerdBm = coldNoisePowerdBm;
    if (state.noiseSourceEnabled && state.currentStep >= 2) {
        // Add excess noise from noise source
        const ENRLinear = Math.pow(10, ENR / 10); // Convert ENR from dB to linear
        const coldNoisePowerLinear = Math.pow(10, coldNoisePowerdBm / 10); // Convert to linear (mW)
        const hotNoisePowerLinear = coldNoisePowerLinear * ENRLinear;
        hotNoisePowerdBm = 10 * Math.log10(hotNoisePowerLinear);
    }

    // Calculate Y-factor (in dB)
    const yFactordB = hotNoisePowerdBm - coldNoisePowerdBm;
    const yFactorLinear = Math.pow(10, yFactordB / 10);

    // Calculate noise figure using Y-factor method
    let noiseFigure = 0;
    if (state.currentStep >= 4 && yFactorLinear > 1) {
        noiseFigure = ENR - 10 * Math.log10(yFactorLinear - 1);
    }

    // Calculate output power (input power + gain)
    const outputPowerdBm = state.inputLevel + state.gain;

    return {
        noisePowerHot: hotNoisePowerdBm,
        noisePowerCold: coldNoisePowerdBm,
        yFactor: yFactordB,
        noiseFigure: Math.max(0, noiseFigure),
        outputPower: outputPowerdBm
    };
}

// Update measurements
function updateMeasurements() {
    state.measurements = calculateNoiseFigure();
    
    document.getElementById('coldNoise').textContent = state.measurements.noisePowerCold.toFixed(1) + ' dBm';
    document.getElementById('hotNoise').textContent = state.measurements.noisePowerHot.toFixed(1) + ' dBm';
    document.getElementById('yFactor').textContent = state.measurements.yFactor.toFixed(2) + ' dB';
    document.getElementById('noiseFigure').textContent = state.measurements.noiseFigure.toFixed(2) + ' dB';
    
    // Update progress
    const progress = ((state.currentStep + 1) / 5) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
    
    // Update formula values
    document.getElementById('formulaValues').innerHTML = 
        `Y = ${state.measurements.yFactor.toFixed(2)} dB<br/>NF = ${state.measurements.noiseFigure.toFixed(2)} dB`;
}

// Circuit drawing functions
function drawSignalGenerator(ctx, x, y) {
    // Generator body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, y, 80, 60);
    
    // Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y + 10, 50, 30);
    
    // Waveform on screen
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
        const waveY = y + 25 + Math.sin(i * 0.3) * 8;
        if (i === 0) ctx.moveTo(x + 15 + i, waveY);
        else ctx.lineTo(x + 15 + i, waveY);
    }
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Signal Gen', x + 40, y + 80);
    
    // Output connector
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 75, y + 25, 10, 10);
}

function drawAmplifier(ctx, x, y) {
    // Amplifier triangle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x + 60, y + 10);
    ctx.lineTo(x + 60, y + 50);
    ctx.closePath();
    ctx.fill();
    
    // Gain symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('A', x + 30, y + 35);
    
    // Label
    ctx.font = '12px Arial';
    ctx.fillText('RF Amplifier', x + 30, y + 80);
    
    // Input/output connectors
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x - 5, y + 25, 10, 10);
    ctx.fillRect(x + 55, y + 25, 10, 10);
}

function drawNoiseSource(ctx, x, y, enabled) {
    // Noise source body
    ctx.fillStyle = enabled ? '#10b981' : '#6b7280';
    ctx.fillRect(x, y, 60, 40);
    
    // Noise symbol
    ctx.strokeStyle = enabled ? '#fff' : '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) {
        const noiseY = y + 20 + (Math.random() - 0.5) * 20;
        if (i === 0) ctx.moveTo(x + 5 + i * 0.8, noiseY);
        else ctx.lineTo(x + 5 + i * 0.8, noiseY);
    }
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Noise Source', x + 30, y + 60);
    ctx.fillText(enabled ? 'ON' : 'OFF', x + 30, y + 75);
    
    // Output connector
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 55, y + 15, 10, 10);
}

function drawSpectrumAnalyzer(ctx, x, y) {
    // Analyzer body
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x, y, 100, 80);
    
    // Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y + 10, 80, 50);
    
    // Spectrum display
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
        const specY = y + 35 + Math.random() * 20 - 10;
        if (i === 0) ctx.moveTo(x + 15 + i, specY);
        else ctx.lineTo(x + 15 + i, specY);
    }
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Spectrum', x + 50, y + 100);
    ctx.fillText('Analyzer', x + 50, y + 115);
    
    // Input connector
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x - 5, y + 35, 10, 10);
}

function drawConnections(ctx) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    
    // Signal generator to amplifier
    ctx.beginPath();
    ctx.moveTo(135, 130);
    ctx.lineTo(295, 130);
    ctx.stroke();
    
    // Amplifier to spectrum analyzer
    ctx.beginPath();
    ctx.moveTo(365, 130);
    ctx.lineTo(545, 135);
    ctx.stroke();
    
    // Noise source to amplifier input (T-junction)
    ctx.beginPath();
    ctx.moveTo(215, 220);
    ctx.lineTo(215, 130);
    ctx.stroke();
}

function drawSignalFlow(ctx, time) {
    // Signal flow from generator
    const signalX = 135 + (time * 50) % 160;
    if (signalX < 295) {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(signalX, 130, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Signal flow to analyzer
    const outputX = 365 + (time * 50) % 180;
    if (outputX < 545) {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(outputX, 135, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Noise injection
    if (state.noiseSourceEnabled) {
        const noiseY = 220 - (time * 30) % 90;
        if (noiseY > 130) {
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(215, noiseY, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function highlightCurrentStep(ctx) {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    switch (state.currentStep) {
        case 0: // Signal generator
            ctx.strokeRect(45, 95, 90, 70);
            break;
        case 1: // Cold measurement
            ctx.strokeRect(545, 95, 110, 90);
            break;
        case 2: // Noise source
            ctx.strokeRect(145, 195, 70, 50);
            break;
        case 3: // Hot measurement
            ctx.strokeRect(545, 95, 110, 90);
            break;
        case 4: // Calculation
            ctx.strokeRect(295, 95, 70, 70);
            break;
    }
    
    ctx.setLineDash([]);
}

function drawCircuit() {
    const canvas = document.getElementById('circuitCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw components
    drawSignalGenerator(ctx, 50, 100);
    drawAmplifier(ctx, 300, 100);
    drawNoiseSource(ctx, 150, 200, state.noiseSourceEnabled);
    drawSpectrumAnalyzer(ctx, 550, 100);
    
    // Draw connections
    drawConnections(ctx);
    
    // Draw signal flow animation
    if (state.isRunning) {
        drawSignalFlow(ctx, animationTime);
    }
    
    // Highlight current step
    highlightCurrentStep(ctx);
}

function animate() {
    if (state.isRunning) {
        animationTime += 0.1;
    }
    
    drawCircuit();
    animationId = requestAnimationFrame(animate);
}

// Graph functions
function drawInputSignalGraph() {
    const canvas = document.getElementById('inputGraphCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Axis labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Time (μs)', width - 80, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude (V)', 0, 0);
    ctx.restore();
    
    // Signal waveform
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const timeScale = document.getElementById('inputTimeScale').value;
    const ampScale = document.getElementById('inputAmpScale').value;
    const centerY = height / 2;
    const amplitude = (state.amplitude / 50) * centerY * 0.6 * ampScale / 2;
    
    for (let x = 30; x < width - 30; x++) {
        const t = (x - 30) * timeScale / 50;
        const y = centerY - amplitude * Math.sin(2 * Math.PI * state.frequency * t / 1000);
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`Frequency: ${state.frequency} MHz`, 40, 30);
    ctx.fillText(`Amplitude: ${state.amplitude} V`, 40, 50);
    ctx.fillText(`Power: ${state.inputLevel} dBm`, 40, 70);
}

function drawNoiseEffectGraph() {
    const canvas = document.getElementById('noiseGraphCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Axis labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Time (μs)', width - 80, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Power (dBm)', 0, 0);
    ctx.restore();
    
    const noiseLevel = document.getElementById('noiseLevel').value;
    const centerY = height / 2;
    
    // Clean signal
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 30; x < width - 30; x++) {
        const t = (x - 30) / 50;
        const y = centerY - 50 * Math.sin(2 * Math.PI * t);
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Noisy signal (when noise source is enabled)
    if (state.noiseSourceEnabled) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 30; x < width - 30; x++) {
            const t = (x - 30) / 50;
            const cleanSignal = 50 * Math.sin(2 * Math.PI * t);
            const noise = (Math.random() - 0.5) * noiseLevel * 10;
            const y = centerY - cleanSignal - noise;
            if (x === 30) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('🟢 Clean Signal', 40, 30);
    if (state.noiseSourceEnabled) {
        ctx.fillText('🔴 Signal + Noise', 40, 50);
    }
    ctx.fillText(`Noise Level: ${noiseLevel}`, 40, height - 30);
}

function drawOutputSignalGraph() {
    const canvas = document.getElementById('outputGraphCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Axis labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Time (μs)', width - 80, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Power (dBm)', 0, 0);
    ctx.restore();
    
    const gainViz = document.getElementById('outputGainViz').value;
    const centerY = height / 2;
    const baseAmplitude = 30;
    const amplifiedAmplitude = baseAmplitude * Math.pow(10, state.gain / 20) * gainViz / 3;
    
    // Input signal (smaller)
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 30; x < width - 30; x++) {
        const t = (x - 30) / 50;
        const y = centerY - baseAmplitude * Math.sin(2 * Math.PI * t);
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Output signal (amplified)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 30; x < width - 30; x++) {
        const t = (x - 30) / 50;
        let y = centerY - amplifiedAmplitude * Math.sin(2 * Math.PI * t);
        
        // Add noise if noise source is enabled
        if (state.noiseSourceEnabled) {
            y += (Math.random() - 0.5) * 20;
        }
        
        // Clamp to canvas bounds
        y = Math.max(30, Math.min(height - 30, y));
        
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('⚫ Input Signal', 40, 30);
    ctx.fillText('🟡 Output Signal (Amplified)', 40, 50);
    ctx.fillText(`Gain: ${state.gain} dB`, 40, 70);
    ctx.fillText(`Output Power: ${state.measurements.outputPower.toFixed(1)} dBm`, 40, 90);
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    // Update respective graph
    if (modalId === 'inputGraphModal') {
        drawInputSignalGraph();
    } else if (modalId === 'noiseGraphModal') {
        drawNoiseEffectGraph();
    } else if (modalId === 'outputGraphModal') {
        drawOutputSignalGraph();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Make graphs draggable
function setupGraphDragging() {
    const graphCanvases = ['inputGraphCanvas', 'noiseGraphCanvas', 'outputGraphCanvas'];
    
    graphCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        
        canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            const rect = canvas.getBoundingClientRect();
            state.dragOffset.x = e.clientX - rect.left;
            state.dragOffset.y = e.clientY - rect.top;
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (state.isDragging) {
                const rect = canvas.getBoundingClientRect();
                const newX = e.clientX - state.dragOffset.x;
                const newY = e.clientY - state.dragOffset.y;
                
                // Update canvas position (visual feedback)
                canvas.style.transform = `translate(${newX}px, ${newY}px)`;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            state.isDragging = false;
            canvas.style.cursor = 'move';
            canvas.style.transform = 'translate(0px, 0px)';
        });
        
        canvas.addEventListener('mouseleave', () => {
            state.isDragging = false;
            canvas.style.cursor = 'move';
            canvas.style.transform = 'translate(0px, 0px)';
        });
    });
}

// Step guide functions
function renderStepGuide() {
    const stepGuide = document.getElementById('stepGuide');
    stepGuide.innerHTML = '';
    
    const currentSteps = steps[state.language];
    
    currentSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = `step ${index === state.currentStep ? 'active' : index < state.currentStep ? 'completed' : ''}`;
        
        stepDiv.innerHTML = `
            <div class="step-header">
                <div class="step-number ${index === state.currentStep ? 'active' : index < state.currentStep ? 'completed' : ''}">
                    ${index < state.currentStep ? '✓' : index + 1}
                </div>
                <h4 style="color: white; font-weight: 600;">${step.title}</h4>
            </div>
            <p style="color: #93c5fd; font-size: 0.875rem; margin-bottom: 0.5rem;">${step.description}</p>
            ${index === state.currentStep ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.3); border-radius: 0.375rem; border: 1px solid rgba(59, 130, 246, 0.3);">
                    <p style="color: #93c5fd; font-size: 0.875rem; margin-bottom: 0.75rem;">
                        <strong>${state.language === 'hi' ? 'निर्देश:' : 'Instructions:'}</strong> ${step.instruction}
                    </p>
                    ${index < currentSteps.length - 1 ? `
                        <button onclick="handleStepAdvance()" ${!state.isRunning ? 'disabled' : ''} class="btn btn-primary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                            ${state.language === 'hi' ? 'अगला चरण →' : 'Next Step →'}
                        </button>
                    ` : `
                        <div class="badge" style="background: #22c55e;">${state.language === 'hi' ? 'मापन पूर्ण!' : 'Measurement Complete!'}</div>
                    `}
                </div>
            ` : ''}
        `;
        
        stepGuide.appendChild(stepDiv);
    });
}

// Event handlers
function toggleSimulation() {
    state.isRunning = !state.isRunning;
    
    const startBtn = document.getElementById('startBtn');
    const statusBadge = document.getElementById('statusBadge');
    const startWarning = document.getElementById('startWarning');
    const controlsWarning = document.getElementById('controlsWarning');
    
    if (state.isRunning) {
        startBtn.innerHTML = '<span>⏸</span> Pause Simulation';
        startBtn.className = 'btn btn-danger';
        statusBadge.textContent = 'RUNNING';
        statusBadge.className = 'badge badge-running';
        startWarning.style.display = 'none';
        controlsWarning.style.display = state.currentStep !== 0 ? 'block' : 'none';
        
        if (state.isVoiceEnabled) {
            speak(steps[state.language][state.currentStep].instruction);
        }
    } else {
        startBtn.innerHTML = '<span>▶</span> Start Simulation';
        startBtn.className = 'btn btn-primary';
        statusBadge.textContent = 'STOPPED';
        statusBadge.className = 'badge badge-stopped';
        startWarning.style.display = 'block';
        controlsWarning.style.display = 'none';
        
        stopSpeaking();
    }
    
    updateControlsState();
    renderStepGuide();
}

function handleReset() {
    state.currentStep = 0;
    state.isRunning = false;
    state.noiseSourceEnabled = false;
    animationTime = 0;
    
    stopSpeaking();
    
    // Reset UI
    document.getElementById('startBtn').innerHTML = '<span>▶</span> Start Simulation';
    document.getElementById('startBtn').className = 'btn btn-primary';
    document.getElementById('statusBadge').textContent = 'STOPPED';
    document.getElementById('statusBadge').className = 'badge badge-stopped';
    document.getElementById('stepBadge').textContent = 'Step 1 of 5';
    document.getElementById('startWarning').style.display = 'block';
    document.getElementById('controlsWarning').style.display = 'none';
    
    // Reset noise source
    document.getElementById('noiseSource').checked = false;
    document.getElementById('noiseSourceStatus').textContent = 'OFF';
    
    updateControlsState();
    updateMeasurements();
    renderStepGuide();
    drawCircuit();
    
    const resetMessage = state.language === 'hi' ? 
        'सिमुलेशन रीसेट। शोर आंकड़ा मापन शुरू करने के लिए तैयार।' : 
        'Simulation reset. Ready to begin noise figure measurement.';
    
    if (state.isVoiceEnabled) {
        speak(resetMessage);
    }
}

function handleStepAdvance() {
    if (state.currentStep < steps[state.language].length - 1) {
        state.currentStep++;
        document.getElementById('stepBadge').textContent = `Step ${state.currentStep + 1} of 5`;
        
        if (state.isVoiceEnabled) {
            speak(steps[state.language][state.currentStep].instruction);
        }
        
        // Auto-configure based on step
        if (state.currentStep === 2) {
            state.noiseSourceEnabled = true;
            document.getElementById('noiseSource').checked = true;
            document.getElementById('noiseSourceStatus').textContent = 'ON';
        }
        
        updateControlsState();
        updateMeasurements();
        renderStepGuide();
    }
}

function updateControlsState() {
    const controls = ['inputLevel', 'amplitude', 'frequency', 'gain', 'temperature', 'noiseSource'];
    const disabled = state.isRunning && state.currentStep !== 0;
    
    controls.forEach(id => {
        document.getElementById(id).disabled = disabled;
    });
    
    document.getElementById('controlsWarning').style.display = disabled ? 'block' : 'none';
}

// Control event listeners
function setupControls() {
    // Input level (dBm)
    document.getElementById('inputLevel').addEventListener('input', (e) => {
        state.inputLevel = parseInt(e.target.value);
        document.getElementById('inputLevelValue').textContent = state.inputLevel + ' dBm';
        updateMeasurements();
    });
    
    // Amplitude (V)
    document.getElementById('amplitude').addEventListener('input', (e) => {
        state.amplitude = parseFloat(e.target.value);
        document.getElementById('amplitudeValue').textContent = state.amplitude.toFixed(1) + ' V';
        updateMeasurements();
    });
    
    // Frequency
    document.getElementById('frequency').addEventListener('input', (e) => {
        state.frequency = parseInt(e.target.value);
        document.getElementById('frequencyValue').textContent = state.frequency + ' MHz';
        updateMeasurements();
    });
    
    // Gain
    document.getElementById('gain').addEventListener('input', (e) => {
        state.gain = parseInt(e.target.value);
        document.getElementById('gainValue').textContent = state.gain + ' dB';
        updateMeasurements();
    });
    
    // Temperature
    document.getElementById('temperature').addEventListener('input', (e) => {
        state.temperature = parseInt(e.target.value);
        document.getElementById('temperatureValue').textContent = state.temperature + ' K';
        updateMeasurements();
    });
    
    // Noise source
    document.getElementById('noiseSource').addEventListener('change', (e) => {
        state.noiseSourceEnabled = e.target.checked;
        document.getElementById('noiseSourceStatus').textContent = state.noiseSourceEnabled ? 'ON' : 'OFF';
        updateMeasurements();
    });
    
    // Voice toggle
    document.getElementById('voiceToggle').addEventListener('change', (e) => {
        state.isVoiceEnabled = e.target.checked;
        if (!state.isVoiceEnabled) {
            stopSpeaking();
        }
    });
    
    // Language selection
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.language = e.target.value;
        renderStepGuide();
    });
    
    // Graph controls
    document.getElementById('showInputGraph').addEventListener('click', () => showModal('inputGraphModal'));
    document.getElementById('showNoiseGraph').addEventListener('click', () => showModal('noiseGraphModal'));
    document.getElementById('showOutputGraph').addEventListener('click', () => showModal('outputGraphModal'));
    
    // Graph control sliders
    document.getElementById('inputTimeScale').addEventListener('input', drawInputSignalGraph);
    document.getElementById('inputAmpScale').addEventListener('input', drawInputSignalGraph);
    document.getElementById('noiseLevel').addEventListener('input', (e) => {
        document.getElementById('noiseLevelValue').textContent = e.target.value;
        drawNoiseEffectGraph();
    });
    document.getElementById('outputGainViz').addEventListener('input', drawOutputSignalGraph);
    
    // Main controls
    document.getElementById('startBtn').addEventListener('click', toggleSimulation);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Initialize
function init() {
    setupControls();
    setupGraphDragging();
    renderStepGuide();
    updateMeasurements();
    drawCircuit();
    animate();
}

// Start when page loads
document.addEventListener('DOMContentLoaded', init);


