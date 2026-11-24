import { type BoardState, getRankTier, isRoundComplete, type RankTier } from '../game/board';

export type Cue =
  | { type: 'reveal'; value: number; flawless: boolean }
  | { type: 'penalty' }
  | { type: 'lost' }
  | { type: 'round'; round: number }
  | { type: 'result'; tier: RankTier };

export interface Tone {
  /** Noise has no pitch: its frequency is the lowest one that is heard. */
  wave: OscillatorType | 'noise';
  from: number;
  /** Slides to this frequency, in Hz. */
  to?: number;
  /** Seconds from the start of the cue. */
  at: number;
  length: number;
  volume: number;
}

/** What the table should hear after a move on the board. Null when the move changed nothing. */
export function getBoardCue(before: BoardState, after: BoardState): Cue | null {
  if (after === before) return null;
  if (after.status === 'finished') return { type: 'result', tier: getRankTier(after.lit, after.burnt) };
  if (after.round !== before.round) return { type: 'round', round: after.round };
  const last = after.reveals.at(-1);
  if (!last) return null;
  if (after.status === 'lost') return { type: 'lost' };
  if (last.penalty) return { type: 'penalty' };
  const flawless = isRoundComplete(after) && after.reveals.every((r) => !r.penalty);
  return { type: 'reveal', value: last.value, flawless };
}

/** C major from C5. Lower notes are too quiet on phone speakers. */
function pitch(degree: number): number {
  const semitones = [0, 2, 4, 5, 7, 9, 11];
  const octave = Math.floor(degree / 7);
  return 523.25 * 2 ** (octave + semitones[degree % 7]! / 12);
}

/** One note after another. */
function melody(degrees: number[], step: number, tone: Pick<Tone, 'wave' | 'volume'>, start = 0): Tone[] {
  return degrees.map((degree, i) => ({
    ...tone,
    from: pitch(degree),
    at: start + i * step,
    // The last note rings.
    length: i === degrees.length - 1 ? step * 3 : step * 1.2,
  }));
}

const BELL = { wave: 'triangle', volume: 0.5 } as const;
const BEEP = { wave: 'square', volume: 0.2 } as const;
const POP: Tone = { wave: 'noise', from: 2500, at: 0, length: 0.15, volume: 0.45 };

const RESULTS: Record<RankTier, Tone[]> = {
  defeat: melody([4, 2, 0], 0.22, BELL),
  mostlyBurnt: melody([2, 1, 2], 0.18, BELL),
  mostlyLit: melody([0, 2, 4, 7], 0.14, BELL),
  perfect: melody([0, 2, 4, 7, 4, 7, 9], 0.13, BELL),
};

export function getTones(cue: Cue): Tone[] {
  switch (cue.type) {
    case 'reveal': {
      const note: Tone = { ...BELL, from: pitch(cue.value - 1), at: 0, length: 0.35 };
      return cue.flawless ? [note, ...melody([7, 9, 11], 0.1, BELL, 0.3)] : [note];
    }
    case 'penalty':
      return [POP, { wave: 'sawtooth', from: 400, to: 130, at: 0.08, length: 0.4, volume: 0.35 }];
    case 'lost':
      return [POP, { wave: 'sawtooth', from: 500, to: 50, at: 0.08, length: 1.3, volume: 0.35 }];
    case 'round':
      // As many beeps as the round number, so a phone that is ahead stands out.
      return melody([0, 1, 2, 4, 5].slice(0, cue.round), 0.13, BEEP);
    case 'result':
      return RESULTS[cue.tier];
  }
}
