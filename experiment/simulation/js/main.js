function updateMeasurementDisplay() {
    // Signal information
    elements.measurementSignalType.textContent = controls.signalType;
    elements.measurementFrequency.textContent = `${controls.frequency} MHz`;

    // Format numbers
    const formatScientific = (value) => {
        if (value === 0) return "0.00";
        if (value < 0.001) return value.toExponential(2);
        return value.toFixed(6);
    };

    const formatNumber = (value, decimals = 2) => value.toFixed(decimals);

    // Cold noise measurement
    if (currentStep >= 1) {
        elements.coldNoiseBadge.textContent = formatScientific(measurements.noisePowerCold);
        elements.coldNoiseBadge.className = 'badge step-1';
    } else {
        elements.coldNoiseBadge.textContent = '---';
        elements.coldNoiseBadge.className = 'badge';
    }

    // Hot noise measurement
    if (currentStep >= 3) {
        elements.hotNoiseBadge.textContent = formatScientific(measurements.noisePowerHot);
        elements.hotNoiseBadge.className = 'badge step-3';
    } else {
        elements.hotNoiseBadge.textContent = '---';
        elements.hotNoiseBadge.className = 'badge';
    }

    // Y-Factor
    if (currentStep >= 4) {
        elements.yFactorBadge.textContent = `${formatNumber(measurements.yFactor)} dB`;
        elements.yFactorBadge.className = 'badge step-4';
    } else {
        elements.yFactorBadge.textContent = '---';
        elements.yFactorBadge.className = 'badge';
    }

    // Noise Figure
    if (currentStep >= 4) {
        elements.noiseFigureBadge.textContent = `${formatNumber(measurements.noiseFigure)} dB`;
        elements.noiseFigureBadge.className = 'badge step-5';
    } else {
        elements.noiseFigureBadge.textContent = '---';
        elements.noiseFigureBadge.className = 'badge';
    }

    // Output Power
    elements.outputPowerBadge.textContent = `${formatNumber(measurements.outputPower)} dBm`;

    // Formula section
    if (currentStep >= 4) {
        elements.formulaSection.style.display = 'block';
        elements.measurementPrompt.style.display = 'none';
        const yRatioVal = measurements.noisePowerHot / measurements.noisePowerCold;
        elements.yRatio.textContent = `Y = P_hot / P_cold = ${formatNumber(yRatioVal)}`;
    } else {
        elements.formulaSection.style.display = 'none';
        if (currentStep < 1) {
            elements.measurementPrompt.style.display = 'block';
        } else {
            elements.measurementPrompt.style.display = 'none';
        }
    }
}

function updateCircuitDisplay() {
    elements.inputPowerText.textContent = `${controls.inputLevel} mW`;
    elements.outputPowerText.textContent = `${measurements.outputPower.toFixed(1)} dBm`;

    if (isRunning) {
        elements.signalIndicator.classList.add('active');
    } else {
        elements.signalIndicator.classList.remove('active');
    }

    if (controls.noiseSourceEnabled && isRunning) {
        elements.noiseIndicator.classList.add('active');
        elements.noiseIndicator.setAttribute('fill', '#ff0000');
        elements.noiseIndicator.setAttribute('opacity', '1');
    } else {
        elements.noiseIndicator.classList.remove('active');
        elements.noiseIndicator.setAttribute('fill', '#ff0000');
        elements.noiseIndicator.setAttribute('opacity', '0.3');
    }
}

function updateStepDisplay() {
    const step = steps[currentStep];

    elements.stepTitle.textContent = step.title;
    elements.stepDescription.textContent = step.description;
    elements.stepInstructionText.textContent = step.instruction;
    elements.stepNumber.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    elements.currentStepDisplay.textContent = `${currentStep + 1}`;

    const progress = ((currentStep + 1) / steps.length) * 100;
    elements.progressFill.style.width = `${progress}%`;

    elements.nextStepBtn.disabled = !isRunning || currentStep >= steps.length - 1;

    if (currentStep === 2) {
        controls.noiseSourceEnabled = true;
        elements.noiseSourceToggle.checked = true;
        updateNoiseSourceDisplay();
    }
}

function updateControlDisplays() {
    elements.signalTypeDisplay.textContent = controls.signalType;
    elements.amplitudeDisplay.textContent = `${controls.amplitude} V`;
    elements.inputLevelDisplay.textContent = `${controls.inputLevel} mW`;
    elements.frequencyDisplay.textContent = `${controls.frequency} MHz`;
    elements.gainDisplay.textContent = `${controls.amplifierGain} dB`;
    elements.temperatureDisplay.textContent = `${controls.temperature} K`;
}

