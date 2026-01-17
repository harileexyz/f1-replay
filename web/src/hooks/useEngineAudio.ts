"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * F1 V6 Turbo Hybrid Engine Audio Synthesizer
 * Creates a more realistic ICE (Internal Combustion Engine) sound
 * with multiple harmonic layers, exhaust crackles, and turbo whistle
 */
export function useEngineAudio(rpm: number, throttle: number, gear: number, isPlaying: boolean) {
    const audioContextRef = useRef<AudioContext | null>(null);

    const oscillatorsRef = useRef<{
        fundamental: OscillatorNode;
        cylinder1: OscillatorNode;
        cylinder2: OscillatorNode;
        cylinder3: OscillatorNode;
        harmonic1: OscillatorNode;
        harmonic2: OscillatorNode;
        turboWhine: OscillatorNode;
        wastegateBlow: OscillatorNode;
    } | null>(null);

    const nodesRef = useRef<{
        noiseSource: AudioBufferSourceNode;
        exhaustFilter: BiquadFilterNode;
        crackleGain: GainNode;
    } | null>(null);

    const gainsRef = useRef<{
        master: GainNode;
        fundamental: GainNode;
        cylinders: GainNode;
        harmonics: GainNode;
        turbo: GainNode;
        exhaust: GainNode;
        wastegate: GainNode;
    } | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const prevGearRef = useRef(gear);
    const prevThrottleRef = useRef(throttle);

    const initAudio = useCallback(async () => {
        if (typeof window === 'undefined') return;

        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            setIsMuted(prev => !prev);
            return;
        }

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        // Master Gain & Limiter/Compressor
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-6, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(8, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.15, ctx.currentTime);

        // Low-pass filter to tame harshness
        const masterFilter = ctx.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.value = 6000;
        masterFilter.Q.value = 0.7;

        masterGain.connect(masterFilter);
        masterFilter.connect(compressor);
        compressor.connect(ctx.destination);

        // === ENGINE LAYERS ===

        // 1. FUNDAMENTAL - Deep engine rumble (square wave for more punch)
        const fundamental = ctx.createOscillator();
        fundamental.type = 'square';
        const fundGain = ctx.createGain();
        fundGain.gain.value = 0;
        fundamental.connect(fundGain);

        // 2. CYLINDER FIRING - Simulate 6 cylinder pulses (V6 engine)
        // Each cylinder fires slightly out of phase
        const cylinder1 = ctx.createOscillator();
        const cylinder2 = ctx.createOscillator();
        const cylinder3 = ctx.createOscillator();
        cylinder1.type = 'sawtooth';
        cylinder2.type = 'sawtooth';
        cylinder3.type = 'sawtooth';

        const cylindersGain = ctx.createGain();
        cylindersGain.gain.value = 0;
        cylinder1.connect(cylindersGain);
        cylinder2.connect(cylindersGain);
        cylinder3.connect(cylindersGain);

        // 3. HIGH HARMONICS - The V6 screaming whine
        const harmonic1 = ctx.createOscillator();
        harmonic1.type = 'sawtooth';
        const harmonic2 = ctx.createOscillator();
        harmonic2.type = 'triangle';

        const harmonicsGain = ctx.createGain();
        harmonicsGain.gain.value = 0;
        harmonic1.connect(harmonicsGain);
        harmonic2.connect(harmonicsGain);

        // 4. TURBO WHISTLE - High-pitched whine that increases with boost
        const turbo = ctx.createOscillator();
        turbo.type = 'sine';
        const turboGain = ctx.createGain();
        turboGain.gain.value = 0;
        turbo.connect(turboGain);

        // 5. WASTEGATE - Blow-off sound on throttle lift
        const wastegate = ctx.createOscillator();
        wastegate.type = 'sawtooth';
        const wastegateGain = ctx.createGain();
        wastegateGain.gain.value = 0;
        wastegate.connect(wastegateGain);

        // 6. EXHAUST NOISE - Crackling and popping
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Add some impulse-like characteristics for crackles
            if (Math.random() > 0.997) {
                output[i] = (Math.random() * 2 - 1) * 0.8;
            } else {
                output[i] = (Math.random() * 2 - 1) * 0.3;
            }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        // Bandpass filter for exhaust character
        const exhaustFilter = ctx.createBiquadFilter();
        exhaustFilter.type = 'bandpass';
        exhaustFilter.frequency.value = 800;
        exhaustFilter.Q.value = 2.0;

        const exhaustGain = ctx.createGain();
        exhaustGain.gain.value = 0;
        noise.connect(exhaustFilter);
        exhaustFilter.connect(exhaustGain);

        // Crackle gain for deceleration pops
        const crackleGain = ctx.createGain();
        crackleGain.gain.value = 0;

        // === DISTORTION CHAIN ===
        // Heavy distortion for raw mechanical sound
        const dist = ctx.createWaveShaper();
        function makeDistortionCurve(amount: number) {
            const k = amount;
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            const deg = Math.PI / 180;
            for (let i = 0; i < n_samples; ++i) {
                const x = (i * 2) / n_samples - 1;
                // More aggressive clipping for harsh engine sound
                curve[i] = Math.tanh(k * x) * 0.8;
            }
            return curve;
        }
        dist.curve = makeDistortionCurve(15);
        dist.oversample = '2x';

        // Cabinet simulation filter
        const cabinet = ctx.createBiquadFilter();
        cabinet.type = 'highshelf';
        cabinet.frequency.value = 3000;
        cabinet.gain.value = -6;

        // Connect engine layers through distortion
        fundGain.connect(dist);
        cylindersGain.connect(dist);
        harmonicsGain.connect(dist);

        dist.connect(cabinet);
        cabinet.connect(masterGain);

        // Turbo and exhaust bypass distortion (cleaner sound)
        turboGain.connect(masterGain);
        wastegateGain.connect(masterGain);
        exhaustGain.connect(masterGain);

        // Start all oscillators
        fundamental.start();
        cylinder1.start();
        cylinder2.start();
        cylinder3.start();
        harmonic1.start();
        harmonic2.start();
        turbo.start();
        wastegate.start();
        noise.start();

        oscillatorsRef.current = {
            fundamental,
            cylinder1,
            cylinder2,
            cylinder3,
            harmonic1,
            harmonic2,
            turboWhine: turbo,
            wastegateBlow: wastegate
        };

        nodesRef.current = {
            noiseSource: noise,
            exhaustFilter,
            crackleGain
        };

        gainsRef.current = {
            master: masterGain,
            fundamental: fundGain,
            cylinders: cylindersGain,
            harmonics: harmonicsGain,
            turbo: turboGain,
            exhaust: exhaustGain,
            wastegate: wastegateGain
        };

        setIsInitialized(true);
        setIsMuted(false);
    }, []);

    useEffect(() => {
        if (!isInitialized || !audioContextRef.current || !gainsRef.current || !oscillatorsRef.current) return;

        const ctx = audioContextRef.current;
        const g = gainsRef.current;
        const o = oscillatorsRef.current;

        if (isMuted || !isPlaying || rpm < 200) {
            g.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
            return;
        }

        // === FREQUENCY MAPPING ===
        // F1 V6 turbo revs from ~4000 to ~15000 RPM
        const rpmNormalized = Math.max(0, Math.min(1, (rpm - 4000) / 11000));

        // Base frequency: ~50Hz at idle, ~180Hz at max RPM
        const baseFreq = 50 + rpmNormalized * 130;

        // Firing frequency (6 cylinders, 4-stroke = 3 power pulses per revolution)
        const firingFreq = (rpm / 60) * 3;

        // === SET OSCILLATOR FREQUENCIES ===

        // Fundamental rumble
        o.fundamental.frequency.setTargetAtTime(baseFreq * 0.5, ctx.currentTime, 0.03);

        // Cylinder firing simulation (slightly detuned for thickness)
        o.cylinder1.frequency.setTargetAtTime(firingFreq, ctx.currentTime, 0.02);
        o.cylinder2.frequency.setTargetAtTime(firingFreq * 1.002, ctx.currentTime, 0.02);
        o.cylinder3.frequency.setTargetAtTime(firingFreq * 0.998, ctx.currentTime, 0.02);

        // Harmonics - the screaming V6 whine
        o.harmonic1.frequency.setTargetAtTime(baseFreq * 4, ctx.currentTime, 0.03);
        o.harmonic2.frequency.setTargetAtTime(baseFreq * 6, ctx.currentTime, 0.03);

        // Turbo whistle - increases with throttle
        const turboFreq = 2000 + (throttle / 100) * 2500 + rpmNormalized * 1000;
        o.turboWhine.frequency.setTargetAtTime(turboFreq, ctx.currentTime, 0.1);

        // Wastegate at high RPM/throttle
        o.wastegateBlow.frequency.setTargetAtTime(800 + rpmNormalized * 400, ctx.currentTime, 0.05);

        // === VOLUME MIXING ===
        const t = throttle / 100;
        const r = rpmNormalized;

        // Master volume
        g.master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.1);

        // Fundamental: Always present, louder at low RPM
        g.fundamental.gain.setTargetAtTime(0.4 * (1 - r * 0.3) + t * 0.2, ctx.currentTime, 0.05);

        // Cylinders: Main engine sound, louder with throttle
        g.cylinders.gain.setTargetAtTime(0.3 + t * 0.4, ctx.currentTime, 0.03);

        // Harmonics: The scream, more prominent at high RPM
        g.harmonics.gain.setTargetAtTime(0.15 + r * 0.25 + t * 0.1, ctx.currentTime, 0.05);

        // Turbo: Subtle whistle, increases with throttle
        g.turbo.gain.setTargetAtTime(t * 0.08, ctx.currentTime, 0.15);

        // Exhaust noise: Crackles more on decel
        const isDecel = throttle < prevThrottleRef.current - 10;
        g.exhaust.gain.setTargetAtTime(
            isDecel ? 0.25 + (1 - t) * 0.3 : 0.1 + t * 0.15,
            ctx.currentTime,
            isDecel ? 0.02 : 0.1
        );

        // Wastegate: Pops on sudden throttle lift
        if (prevThrottleRef.current > 80 && throttle < 50) {
            // Wastegate blow-off
            const now = ctx.currentTime;
            g.wastegate.gain.cancelScheduledValues(now);
            g.wastegate.gain.setValueAtTime(0.4, now);
            g.wastegate.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        }

        // === GEAR CHANGE EFFECT ===
        if (gear !== prevGearRef.current) {
            const now = ctx.currentTime;
            // Brief volume dip simulating clutch/throttle blip
            g.master.gain.cancelScheduledValues(now);
            g.master.gain.setValueAtTime(0.7, now);
            g.master.gain.linearRampToValueAtTime(0.1, now + 0.02);
            g.master.gain.linearRampToValueAtTime(0.7, now + 0.08);

            // Pop on downshift
            if (gear < prevGearRef.current) {
                g.exhaust.gain.cancelScheduledValues(now);
                g.exhaust.gain.setValueAtTime(0.5, now);
                g.exhaust.gain.exponentialRampToValueAtTime(0.1, now + 0.15);
            }

            prevGearRef.current = gear;
        }

        prevThrottleRef.current = throttle;

    }, [rpm, throttle, gear, isPlaying, isInitialized, isMuted]);

    // Cleanup on unmount - stop all audio
    useEffect(() => {
        return () => {
            if (oscillatorsRef.current) {
                try {
                    oscillatorsRef.current.fundamental.stop();
                    oscillatorsRef.current.cylinder1.stop();
                    oscillatorsRef.current.cylinder2.stop();
                    oscillatorsRef.current.cylinder3.stop();
                    oscillatorsRef.current.harmonic1.stop();
                    oscillatorsRef.current.harmonic2.stop();
                    oscillatorsRef.current.turboWhine.stop();
                    oscillatorsRef.current.wastegateBlow.stop();
                } catch (e) {
                    // Oscillators may already be stopped
                }
            }
            if (nodesRef.current?.noiseSource) {
                try {
                    nodesRef.current.noiseSource.stop();
                } catch (e) {
                    // Noise source may already be stopped
                }
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            oscillatorsRef.current = null;
            nodesRef.current = null;
            gainsRef.current = null;
        };
    }, []);

    return {
        isEnabled: isInitialized && !isMuted,
        initAudio,
        isMuted
    };
}
