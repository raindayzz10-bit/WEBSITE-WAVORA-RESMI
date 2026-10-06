/**
 * Synthesizes an authentic thermal receipt printer sound using the Web Audio API.
 * Requires zero external audio files - 100% lightweight, instant, and reliable offline.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playThermalPrinterSound(isMuted: boolean = false): () => void {
  if (isMuted) return () => {};

  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.28, now);
  masterGain.connect(ctx.destination);

  let isStopped = false;

  // 1. Thermal Stepper Motor Buzz Generator (pulses of gear drive)
  const scheduleFeedBurst = (startTime: number, duration: number, pitch: number = 190) => {
    if (isStopped) return;

    // Pulse oscillator for motor vibration
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch, startTime);
    // Slight pitch wobble for realistic physical motor
    osc.frequency.linearRampToValueAtTime(pitch + 15, startTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(pitch - 10, startTime + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.Q.setValueAtTime(2.5, startTime);

    // Fast amplitude modulation to simulate stepper gear teeth (32 Hz)
    const amOsc = ctx.createOscillator();
    const amGain = ctx.createGain();
    amOsc.type = 'square';
    amOsc.frequency.setValueAtTime(32, startTime);
    amGain.gain.setValueAtTime(0.5, startTime);

    amOsc.connect(amGain.gain);
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(masterGain);

    oscGain.gain.setValueAtTime(0.001, startTime);
    oscGain.gain.linearRampToValueAtTime(0.35, startTime + 0.04);
    oscGain.gain.setValueAtTime(0.35, startTime + duration - 0.04);
    oscGain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    try {
      osc.start(startTime);
      amOsc.start(startTime);
      osc.stop(startTime + duration);
      amOsc.stop(startTime + duration);
    } catch {
      // Ignore if context suspended
    }

    // Highpass noise for paper friction & thermal head sliding
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1400, startTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
    noiseGain.gain.setValueAtTime(0.12, startTime + duration - 0.03);
    noiseGain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    try {
      whiteNoise.start(startTime);
      whiteNoise.stop(startTime + duration);
    } catch {
      // Ignore
    }
  };

  // Schedule 3 rhythmic paper feed bursts across 1.8 seconds
  scheduleFeedBurst(now + 0.05, 0.42, 185); // Burst 1: Header feed
  scheduleFeedBurst(now + 0.52, 0.55, 210); // Burst 2: Athlete biodata feed
  scheduleFeedBurst(now + 1.15, 0.45, 195); // Burst 3: Total & barcode feed

  // 2. Mechanical Cutter "Snick" click at 1.72s
  const cutterTime = now + 1.72;
  const cutterOsc = ctx.createOscillator();
  const cutterGain = ctx.createGain();
  cutterOsc.type = 'triangle';
  cutterOsc.frequency.setValueAtTime(680, cutterTime);
  cutterOsc.frequency.exponentialRampToValueAtTime(90, cutterTime + 0.05);

  cutterGain.gain.setValueAtTime(0.45, cutterTime);
  cutterGain.gain.exponentialRampToValueAtTime(0.001, cutterTime + 0.06);

  cutterOsc.connect(cutterGain);
  cutterGain.connect(masterGain);

  try {
    cutterOsc.start(cutterTime);
    cutterOsc.stop(cutterTime + 0.06);
  } catch {}

  // 3. Pleasant Kiosk Success Bell / Chime (880 Hz -> 1320 Hz) at 1.80s
  const chimeTime = now + 1.80;
  const chime1 = ctx.createOscillator();
  const chime2 = ctx.createOscillator();
  const chimeGain = ctx.createGain();

  chime1.type = 'sine';
  chime2.type = 'sine';
  chime1.frequency.setValueAtTime(880, chimeTime); // A5
  chime2.frequency.setValueAtTime(1320, chimeTime + 0.08); // E6

  chimeGain.gain.setValueAtTime(0.001, chimeTime);
  chimeGain.gain.linearRampToValueAtTime(0.18, chimeTime + 0.02);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.55);

  chime1.connect(chimeGain);
  chime2.connect(chimeGain);
  chimeGain.connect(masterGain);

  try {
    chime1.start(chimeTime);
    chime1.stop(chimeTime + 0.55);
    chime2.start(chimeTime + 0.08);
    chime2.stop(chimeTime + 0.55);
  } catch {}

  // Cleanup cancel function
  return () => {
    isStopped = true;
    try {
      masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      setTimeout(() => masterGain.disconnect(), 60);
    } catch {}
  };
}
