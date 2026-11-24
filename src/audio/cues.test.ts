import { describe, expect, it } from 'vitest';
import { type BoardState, boardReducer, createBoard } from '../game/board';
import { dealRound } from '../game/seededDeal';
import { ROUNDS, type Room } from '../game/types';
import { type Cue, getBoardCue, getTones } from './cues';

const room: Room = {
  seed: 7392,
  names: Array.from({ length: 6 }, (_, i) => `Player ${i + 1}`),
  first: 1,
  complexity: 'normal',
  ratings: ['family', 'fun'],
  game: 1,
};
const ascending = [...dealRound(room, 1)].sort((a, b) => a[1] - b[1]).map(([seat]) => seat);

function reveal(board: BoardState, seats: number[]): { board: BoardState; cues: (Cue | null)[] } {
  const cues: (Cue | null)[] = [];
  for (const seat of seats) {
    const next = boardReducer(board, { type: 'reveal', seat });
    cues.push(getBoardCue(board, next));
    board = next;
  }
  return { board, cues };
}

describe('board cues', () => {
  it('plays the value of each safe card and a flourish only at the end of a flawless round', () => {
    const { cues } = reveal(createBoard(room), ascending);
    expect(cues).toEqual(
      ascending.map((seat, i) => ({
        type: 'reveal',
        value: dealRound(room, 1).get(seat),
        flawless: i === ascending.length - 1,
      })),
    );
  });

  it('plays the penalty, and no flourish after it', () => {
    const [first, second, ...rest] = ascending;
    const { cues } = reveal(createBoard(room), [second!, first!, ...rest]);
    expect(cues[1]).toEqual({ type: 'penalty' });
    expect(cues.at(-1)).toMatchObject({ type: 'reveal', flawless: false });
  });

  it('plays the loss instead of the last penalty', () => {
    const { cues } = reveal({ ...createBoard(room), lit: 1 }, [...ascending].reverse().slice(0, 2));
    expect(cues[1]).toEqual({ type: 'lost' });
  });

  it('is silent when the move is ignored', () => {
    const { cues } = reveal(createBoard(room), [ascending[0]!, ascending[0]!]);
    expect(cues[1]).toBeNull();
    const board = createBoard(room);
    expect(getBoardCue(board, boardReducer(board, { type: 'next' }))).toBeNull();
  });

  it('plays the new round, then the result after the last one', () => {
    const { board } = reveal(createBoard(room), ascending);
    expect(getBoardCue(board, boardReducer(board, { type: 'next' }))).toEqual({ type: 'round', round: 2 });
    const last = { ...board, round: ROUNDS };
    expect(getBoardCue(last, { ...last, status: 'finished' })).toEqual({ type: 'result', tier: 'perfect' });
  });
});

describe('tones', () => {
  it('rise with the number on the card', () => {
    const pitches = Array.from({ length: 10 }, (_, i) =>
      getTones({ type: 'reveal', value: i + 1, flawless: false })[0]!.from,
    );
    expect(pitches).toEqual([...new Set(pitches)].sort((a, b) => a - b));
  });

  it('beep as many times as the round number', () => {
    for (let round = 1; round <= ROUNDS; round++) {
      expect(getTones({ type: 'round', round })).toHaveLength(round);
    }
  });
});
