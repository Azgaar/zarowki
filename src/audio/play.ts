import { load, save } from '../game/storage';
import { type Cue, getTones, type Tone } from './cues';

const FADE = 0.008;
/** A sound that could not start in time is dropped: late, it would be confusing. */
const MAX_DELAY_MS = 1000;

let context: AudioContext | undefined;
let soundOn = load('sound') !== false;

export const isSoundOn = () => soundOn;

export function setSoundOn(on: boolean): void {
  soundOn = on;
  save('sound', on);
  if (on) return;
  // Stops what is playing now.
  void context?.close();
  context = undefined;
}

function getContext(): AudioContext {
  if (!context) {
    // Otherwise the silent switch of an iPhone mutes the game. Not in the TypeScript DOM types yet.
    const { audioSession } = navigator as { audioSession?: { type: string } };
    if (audioSession) audioSession.type = 'playback';
    context = new AudioContext();
  }
  return context;
}

function createSource(ctx: BaseAudioContext, tone: Tone, start: number, end: number): AudioScheduledSourceNode {
  if (tone.wave === 'noise') {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * tone.length), ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    return new AudioBufferSourceNode(ctx, { buffer });
  }
  const oscillator = new OscillatorNode(ctx, { type: tone.wave, frequency: tone.from });
  if (tone.to !== undefined) {
    oscillator.frequency.setValueAtTime(tone.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(tone.to, end);
  }
  return oscillator;
}

export function schedule(ctx: BaseAudioContext, tones: Tone[]): void {
  for (const tone of tones) {
    const start = ctx.currentTime + tone.at;
    const end = start + tone.length;
    const source = createSource(ctx, tone, start, end);
    const volume = new GainNode(ctx, { gain: 0 });
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(tone.volume, start + FADE);
    volume.gain.exponentialRampToValueAtTime(0.001, end);

    if (tone.wave === 'noise') {
      source.connect(new BiquadFilterNode(ctx, { type: 'highpass', frequency: tone.from })).connect(volume);
    } else {
      source.connect(volume);
    }
    volume.connect(ctx.destination);
    source.start(start);
    source.stop(end);
  }
}

/** Call from a tap handler, as browsers block other sounds. Never throws: the game works without sounds. */
export async function play(cue: Cue): Promise<void> {
  if (!soundOn) return;
  try {
    const asked = performance.now();
    const ctx = getContext();
    // Suspended at first, and again after a call or a locked screen.
    if (ctx.state !== 'running') await ctx.resume();
    if (performance.now() - asked < MAX_DELAY_MS) schedule(ctx, getTones(cue));
  } catch {
    // No Web Audio, or the browser refused.
  }
}
