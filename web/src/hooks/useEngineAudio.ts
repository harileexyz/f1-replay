"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

export function useEngineAudio(rpm: number, throttle: number, gear: number, isPlaying: boolean) {
    const audioContextRef = useRef<AudioContext | null>(null);

    const oscillatorsRef = useRef<{
        fundamental: OscillatorNode;
        harmonic1: OscillatorNode;
        harmonic2: OscillatorNode;
        turboWhine: OscillatorNode;
        noiseSource: AudioBufferSourceNode;
    } | null>(null);

    const gainsRef = useRef<{
        master: GainNode;
        fundamental: GainNode;
        harmonic: GainNode;
        turbo: GainNode;
        exhaust: GainNode;
    } | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const prevGearRef = useRef(gear);

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

        // Master Gain & Limiter
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-10, ctx.currentTime);
        compressor.knee.setValueAtTime(40, ctx.currentTime);
        compressor.ratio.setValueAtTime(12, ctx.currentTime);
        compressor.attack.setValueAtTime(0, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);

        masterGain.connect(compressor);
        compressor.connect(ctx.destination);

        // Layers
        // 1. Fundamental Saw (Low end power)
        const fundamental = ctx.createOscillator();
        fundamental.type = 'sawtooth';
        const fundGain = ctx.createGain();
        fundamental.connect(fundGain);

        // 2. High Screen Harmonics (V6 Whine)
        const harmonic1 = ctx.createOscillator();
        harmonic1.type = 'sawtooth';
        const harmonic2 = ctx.createOscillator();
        harmonic2.type = 'triangle';
        const harmGain = ctx.createGain();
        harmonic1.connect(harmGain);
        harmonic2.connect(harmGain);

        // 3. Turbo Whistle (Sine)
        const turbo = ctx.createOscillator();
        turbo.type = 'sine';
        const turboGain = ctx.createGain();
        turbo.connect(turboGain);

        // 4. Exhaust Air/Noise (Filtered Noise)
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const exhaustFilter = ctx.createBiquadFilter();
        exhaustFilter.type = 'bandpass';
        exhaustFilter.Q.value = 1.0;
        const noiseGain = ctx.createGain();
        noise.connect(exhaustFilter);
        exhaustFilter.connect(noiseGain);

        // Main Distortion/Cabinet Filter Path
        const dist = ctx.createWaveShaper();
        function makeDistortionCurve(amount: number) {
            let k = amount, n_samples = 44100, curve = new Float32Array(n_samples), deg = Math.PI / 180;
            for (let i = 0; i < n_samples; ++i) {
                let x = i * 2 / n_samples - 1;
                curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        dist.curve = makeDistortionCurve(100);

        fundGain.connect(dist);
        harmGain.connect(dist);
        dist.connect(masterGain);
        turboGain.connect(masterGain);
        noiseGain.connect(masterGain);

        fundamental.start();
        harmonic1.start();
        harmonic2.start();
        turbo.start();
        noise.start();

        oscillatorsRef.current = { fundamental, harmonic1, harmonic2, turboWhine: turbo, noiseSource: noise };
        gainsRef.current = { master: masterGain, fundamental: fundGain, harmonic: harmGain, turbo: turboGain, exhaust: noiseGain };

        setIsInitialized(true);
        setIsMuted(false);
    }, []);

    useEffect(() => {
        if (!isInitialized || !audioContextRef.current || !gainsRef.current || !oscillatorsRef.current) return;

        const ctx = audioContextRef.current;
        const g = gainsRef.current;
        const o = oscillatorsRef.current;

        if (isMuted || !isPlaying || rpm < 200) {
            console.log("AudioEngine: Muted or Not Playing", { isMuted, isPlaying, rpm });
            g.master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
            return;
        }

        // RPM mapping - Shifted slightly higher for better laptop speaker presence
        const pitchIdx = rpm / 15000;
        const baseFreq = pitchIdx * 450 + 60;

        o.fundamental.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.05);
        o.harmonic1.frequency.setTargetAtTime(baseFreq * 2.5, ctx.currentTime, 0.05);
        o.harmonic2.frequency.setTargetAtTime(baseFreq * 3.5, ctx.currentTime, 0.05); // High-pitched scream
        o.turboWhine.frequency.setTargetAtTime(3000 + (throttle * 30), ctx.currentTime, 0.1);

        const t = throttle / 100;

        console.log(`AudioEngine: Active - RPM=${rpm.toFixed(0)}, Thr=${throttle.toFixed(0)}%, Volume=${(0.6 + t * 0.4).toFixed(2)}`);

        // Master volume - Full power
        g.master.gain.setTargetAtTime(1.0, ctx.currentTime, 0.1);

        // Mix component volumes - BOOSTED
        g.fundamental.gain.setTargetAtTime(0.5 + (t * 0.4), ctx.currentTime, 0.05);
        g.harmonic.gain.setTargetAtTime(0.4 + (t * 0.4), ctx.currentTime, 0.05);
        g.turbo.gain.setTargetAtTime(t * 0.2, ctx.currentTime, 0.1);
        g.exhaust.gain.setTargetAtTime(0.2 + (t * 0.2), ctx.currentTime, 0.05);

        if (gear !== prevGearRef.current) {
            const now = ctx.currentTime;
            g.master.gain.cancelScheduledValues(now);
            g.master.gain.setValueAtTime(1.0, now);
            g.master.gain.linearRampToValueAtTime(0.05, now + 0.02);
            g.master.gain.linearRampToValueAtTime(1.0, now + 0.1);
            prevGearRef.current = gear;
        }

    }, [rpm, throttle, gear, isPlaying, isInitialized, isMuted]);

    return {
        isEnabled: isInitialized && !isMuted,
        initAudio,
        isMuted
    };
}
