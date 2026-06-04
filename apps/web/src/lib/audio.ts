/**
 * Web Audio API Ambient Engine Synth
 * Programmatic synthesizer generating a low-frequency motorsport rumble/pad.
 * Zero external asset dependencies.
 */

let audioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let mainGain: GainNode | null = null;
let lfo: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let active = false;

export function initAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  audioCtx = new AudioContextClass();
}

export function startAmbientEngine() {
  if (active) return;
  initAudio();
  
  if (!audioCtx) return;
  
  // Resume context if suspended (browser security)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  active = true;

  // 1. Oscillators: Detroit detuning for thick chorus
  osc1 = audioCtx.createOscillator();
  osc2 = audioCtx.createOscillator();
  
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  
  // Deep base frequency (A1 / A0 scale)
  osc1.frequency.setValueAtTime(52.0, audioCtx.currentTime); // ~A1 flat
  osc2.frequency.setValueAtTime(52.4, audioCtx.currentTime); // detuned

  // 2. Filter: Low-pass with high resonance to keep it dark but warm
  filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(80, audioCtx.currentTime);
  filter.Q.setValueAtTime(5.5, audioCtx.currentTime);

  // 3. LFO: Creates the breathing, throbbing motor pulse
  lfo = audioCtx.createOscillator();
  lfoGain = audioCtx.createGain();
  
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(2.2, audioCtx.currentTime); // 2.2Hz pulsing rate
  lfoGain.gain.setValueAtTime(12, audioCtx.currentTime); // sweeps cutoff +-12Hz

  // 4. Main Gain: VERY quiet and atmospheric
  mainGain = audioCtx.createGain();
  mainGain.gain.setValueAtTime(0.001, audioCtx.currentTime); // start silent for fade-in

  // Connections
  lfo.connect(lfoGain);
  if (filter.frequency) {
    lfoGain.connect(filter.frequency);
  }

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  // Start nodes
  osc1.start();
  osc2.start();
  lfo.start();

  // Smooth fade-in
  mainGain.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + 1.5);
}

export function stopAmbientEngine() {
  if (!active || !audioCtx) return;
  
  const now = audioCtx.currentTime;
  
  // Fade-out to avoid pop clicks
  if (mainGain) {
    mainGain.gain.cancelScheduledValues(now);
    mainGain.gain.setValueAtTime(mainGain.gain.value, now);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  }

  setTimeout(() => {
    try {
      osc1?.stop();
      osc2?.stop();
      lfo?.stop();
      
      osc1?.disconnect();
      osc2?.disconnect();
      lfo?.disconnect();
      filter?.disconnect();
      mainGain?.disconnect();
    } catch (e) {
      // already stopped/disconnected
    }

    osc1 = null;
    osc2 = null;
    lfo = null;
    lfoGain = null;
    filter = null;
    mainGain = null;
    active = false;
  }, 600);
}

/**
 * Modulate ambient pitch and filter cutoff based on scroll activity or speed.
 * @param speedFactor value from 0 (static) to 1 (high speed)
 */
export function modulateEngine(speedFactor: number) {
  if (!active || !audioCtx) return;

  const now = audioCtx.currentTime;
  
  // Smooth target settings
  const targetFreq = 52.0 + speedFactor * 14.0; // detuned pitch goes up
  const targetFilter = 80.0 + speedFactor * 55.0; // filter opens up, more raw sound
  const targetLfoRate = 2.2 + speedFactor * 2.8; // throbbing speed increases

  if (osc1 && osc2 && filter && lfo) {
    osc1.frequency.setTargetAtTime(targetFreq, now, 0.35);
    osc2.frequency.setTargetAtTime(targetFreq + 0.4, now, 0.35);
    filter.frequency.setTargetAtTime(targetFilter, now, 0.25);
    lfo.frequency.setTargetAtTime(targetLfoRate, now, 0.4);
  }
}

export function isEngineRunning() {
  return active;
}
