/**
 * Aquatic Sound Engine - Web Audio API Synthesizer
 * Generates an organic, calming ambient underwater/pool soundscape
 * without downloading external audio files. Autoplay-safe & muted by default.
 */

class AquaticSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private listeners: Set<(playing: boolean) => void> = new Set();

  constructor() {
    // Handle tab visibility change to conserve resources and avoid startling users
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.isPlaying) {
          this.pauseTemporary();
        } else if (!document.hidden && this.wasPlayingBeforeHidden) {
          this.resumeAfterVisible();
        }
      });
    }
  }

  private wasPlayingBeforeHidden = false;

  private pauseTemporary() {
    this.wasPlayingBeforeHidden = true;
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  private resumeAfterVisible() {
    this.wasPlayingBeforeHidden = false;
    if (this.ctx && this.ctx.state === 'suspended' && this.isPlaying) {
      this.ctx.resume().catch(() => {});
    }
  }

  private initAudioContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Generates a seamless buffer of pink noise (calm water sound profile)
   */
  private createPinkNoiseBuffer(durationSeconds = 6): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.initAudioContext();
      if (!this.ctx) return;

      if (this.isPlaying) return;

      const now = this.ctx.currentTime;

      // Master Gain with gentle fade in
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      // Gentle target volume - calming, background aquatic ambiance
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.6);
      this.masterGain.connect(this.ctx.destination);

      // Noise Source (Looping Pink Noise)
      const noiseBuffer = this.createPinkNoiseBuffer(6);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Resonant Lowpass Filter (Underwater depth simulator)
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(320, now);
      this.filterNode.Q.setValueAtTime(2.5, now);

      // Slow LFO (simulates gentle ocean swell / pool laps)
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(0.18, now); // 1 swell every ~5.5s

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(140, now); // Sweep between 180Hz and 460Hz

      this.lfoNode.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);

      // High Shimmer Bandpass (Water surface sparkle)
      const shimmerFilter = this.ctx.createBiquadFilter();
      shimmerFilter.type = 'bandpass';
      shimmerFilter.frequency.setValueAtTime(1200, now);
      shimmerFilter.Q.setValueAtTime(1.8, now);

      const shimmerGain = this.ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.035, now);

      // Connect pipeline
      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);

      this.noiseNode.connect(shimmerFilter);
      shimmerFilter.connect(shimmerGain);
      shimmerGain.connect(this.masterGain);

      // Start oscillators
      this.noiseNode.start(now);
      this.lfoNode.start(now);

      this.isPlaying = true;
      this.notifyListeners(true);
    } catch (err) {
      console.warn('Failed to start aquatic audio:', err);
      this.isPlaying = false;
      this.notifyListeners(false);
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.isPlaying = false;
      this.notifyListeners(false);
      return;
    }

    try {
      const now = this.ctx.currentTime;
      // Smooth fade out to eliminate audio click
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      setTimeout(() => {
        try {
          if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
          if (this.lfoNode) {
            this.lfoNode.stop();
            this.lfoNode.disconnect();
            this.lfoNode = null;
          }
        } catch {
          // Ignore clean-up errors
        }
      }, 1300);

      this.isPlaying = false;
      this.notifyListeners(false);
    } catch {
      this.isPlaying = false;
      this.notifyListeners(false);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(callback: (playing: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isPlaying);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(state: boolean) {
    this.listeners.forEach((cb) => cb(state));
  }
}

export const aquaticSoundEngine = new AquaticSoundEngine();
