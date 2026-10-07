type AudioContextConstructor = typeof AudioContext;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Synthesised paper sounds (no audio files). A page turn is shaped noise:
 * a band-passed "swish" whose centre frequency sweeps upward, a low air
 * rush, and a randomly modulated "crinkle" layer. Landing adds a soft thud.
 */
class PageTurnSound {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private lastPlayedAt = 0;

  enabled = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      const Constructor: AudioContextConstructor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioContextConstructor })
          .webkitAudioContext;
      if (!Constructor) return null;

      this.context = new Constructor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.context.destination);
      this.noise = this.createPinkNoise(this.context, 2);
    }

    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  /** Paul Kellet's economical pink-noise filter: softer and more natural than white noise. */
  private createPinkNoise(context: AudioContext, seconds: number): AudioBuffer {
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * seconds),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /** Call from a user gesture so the browser allows audio to start. */
  unlock(): void {
    this.ensureContext();
  }

  /** One leaf sweeping through the air. `intensity` is 0..1 (flip speed). */
  playTurn(intensity = 1): void {
    if (!this.enabled) return;
    const context = this.ensureContext();
    if (!context || !this.master || !this.noise) return;

    const now = context.currentTime;
    if (now - this.lastPlayedAt < 0.07) return;
    this.lastPlayedAt = now;

    const strength = clamp(intensity, 0.25, 1);
    const duration = 0.55 - strength * 0.2;
    const offset = Math.random() * (this.noise.duration - duration - 0.1);

    // Swish: band-passed noise sweeping upward as the leaf accelerates.
    const swish = context.createBufferSource();
    swish.buffer = this.noise;
    swish.playbackRate.value = 0.9 + Math.random() * 0.25;

    const band = context.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(1300, now);
    band.frequency.exponentialRampToValueAtTime(4600, now + duration * 0.75);

    const highpass = context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 520;

    const crinkle = context.createGain();
    const curve = new Float32Array(40);
    for (let i = 0; i < curve.length; i++) curve[i] = 0.35 + Math.random() * 0.65;
    crinkle.gain.setValueCurveAtTime(curve, now, duration);

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(0.55 * strength, now + duration * 0.28);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    swish.connect(band).connect(highpass).connect(crinkle).connect(envelope);
    envelope.connect(this.master);
    swish.start(now, offset, duration + 0.05);
    swish.stop(now + duration + 0.08);

    // Air rush: the low, breathy part of the movement.
    const air = context.createBufferSource();
    air.buffer = this.noise;
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;
    const airEnvelope = context.createGain();
    airEnvelope.gain.setValueAtTime(0.0001, now);
    airEnvelope.gain.linearRampToValueAtTime(0.4 * strength, now + duration * 0.4);
    airEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.05);
    air.connect(lowpass).connect(airEnvelope).connect(this.master);
    air.start(now, Math.random() * (this.noise.duration - duration - 0.1), duration + 0.1);
    air.stop(now + duration + 0.12);
  }

  /** The soft pat of a leaf settling onto the pile. */
  playLand(strength = 1): void {
    if (!this.enabled) return;
    const context = this.ensureContext();
    if (!context || !this.master || !this.noise) return;

    const now = context.currentTime;
    const level = clamp(strength, 0.3, 1);

    const thud = context.createBufferSource();
    thud.buffer = this.noise;
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 190;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(0.5 * level, now + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    thud.connect(lowpass).connect(envelope).connect(this.master);
    thud.start(now, Math.random() * 1.5, 0.16);
    thud.stop(now + 0.18);

    const tick = context.createBufferSource();
    tick.buffer = this.noise;
    const highpass = context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 3200;
    const tickEnvelope = context.createGain();
    tickEnvelope.gain.setValueAtTime(0.0001, now);
    tickEnvelope.gain.linearRampToValueAtTime(0.12 * level, now + 0.004);
    tickEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    tick.connect(highpass).connect(tickEnvelope).connect(this.master);
    tick.start(now, Math.random() * 1.5, 0.08);
    tick.stop(now + 0.1);
  }
}

export const pageTurnSound = new PageTurnSound();
