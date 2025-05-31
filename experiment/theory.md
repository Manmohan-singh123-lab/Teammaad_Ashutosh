The noise figure (NF) of an amplifier is a key parameter used to evaluate how much additional noise the amplifier introduces to a signal. When a signal passes through any electronic device, particularly amplifiers, some internal noise is added due to thermal agitation, component imperfections, and active device behavior. The NF quantifies this added noise in terms of how much it degrades the signal-to-noise ratio (SNR).


### 1. Definition of Noise Figure:

The Noise Figure (F) is defined as:

F = (SNR_in) / (SNR_out)

Where:

SNR_in: Signal-to-noise ratio at the input

SNR_out: Signal-to-noise ratio at the output

This means that a perfect amplifier (no added noise) would have a noise figure of 1 (or 0 dB), indicating no degradation in SNR. In practice, amplifiers have NF > 1.

In decibel form, the Noise Figure is:

NF(dB) = 10 * log10(F)


### 2. Significance of Noise Figure:

The lower the noise figure, the better the amplifier is at preserving the input signal quality.

It's crucial in systems like RF communication, satellite receivers, radar, and medical imaging, where weak signals need to be amplified without adding too much noise.


### 3. Methods of Measurement:

One common method used in the lab to measure NF is the Y-Factor Method, which uses a calibrated noise source that can switch between two known states:

Hot (high noise temperature, typically ~2900 K)

Cold (standard room temperature, ~290 K)

The Y-factor (Y) is defined as:

Y = P_hot / P_cold

Where:

𝑃_hot: Output noise power with the hot source

𝑃_cold: Output noise power with the cold source

Using the Y-factor and known excess noise ratio (ENR) of the noise source, the Noise Figure of the amplifier can be calculated using:

F = [(T_H - T_0) / (Y - 1)] + T_0

Where:

𝑇_𝐻: Noise temperature of hot source

𝑇_0: Standard temperature (290 K)

The system typically includes:

A noise source

The amplifier under test

A spectrum analyzer or noise figure meter


### 4. Practical Considerations:

The gain of the amplifier must be high enough to minimize the effect of measurement equipment noise.

Proper impedance matching and calibration are essential for accurate results.

The noise figure varies with frequency, so measurements are often frequency-specific.
