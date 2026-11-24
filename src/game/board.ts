import { isInteger } from './isInteger';
import { checkRoom } from './room';
import { dealRound, getStartingLamps } from './seededDeal';
import { ROUNDS, type Room } from './types';
import { VERSION } from './version';

export interface Reveal {
  seat: number;
  value: number;
  penalty: boolean;
}

export interface BoardState {
  version: string;
  room: Room;
  round: number;
  reveals: Reveal[];
  lit: number;
  burnt: number;
  status: 'playing' | 'lost' | 'finished';
}

export type BoardAction = { type: 'reveal'; seat: number } | { type: 'next' };

export type RankTier = 'defeat' | 'mostlyBurnt' | 'mostlyLit' | 'perfect';

export function createBoard(room: Room): BoardState {
  return {
    version: VERSION,
    room,
    round: 1,
    reveals: [],
    lit: getStartingLamps(room.names.length, room.complexity),
    burnt: 0,
    status: 'playing',
  };
}

/** Null when the saved board is damaged or from an incompatible version. */
export function restoreBoard(saved: unknown): BoardState | null {
  if (typeof saved !== 'object' || saved === null) return null;
  const { version, room, round, reveals, lit, burnt, status } = saved as Partial<BoardState>;
  const valid =
    version === VERSION &&
    room &&
    checkRoom(room) &&
    isInteger(round, 1, ROUNDS) &&
    isInteger(lit, 0) &&
    isInteger(burnt, 0) &&
    ['playing', 'lost', 'finished'].includes(status!) &&
    Array.isArray(reveals) &&
    reveals.every((r) => isInteger(r?.seat, 1) && isInteger(r?.value, 1, 10));
  return valid ? (saved as BoardState) : null;
}

export function isRoundComplete(state: BoardState): boolean {
  return state.reveals.length === dealRound(state.room, state.round).size;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  if (state.status !== 'playing') return state;

  if (action.type === 'next') {
    if (!isRoundComplete(state)) return state;
    if (state.round === ROUNDS) return { ...state, status: 'finished' };
    return { ...state, round: state.round + 1, reveals: [] };
  }

  const value = dealRound(state.room, state.round).get(action.seat);
  if (value === undefined || state.reveals.some((r) => r.seat === action.seat)) return state;
  const previous = state.reveals.at(-1);
  const penalty = previous !== undefined && value < previous.value;
  const lit = state.lit - (penalty ? 1 : 0);
  return {
    ...state,
    reveals: [...state.reveals, { seat: action.seat, value, penalty }],
    lit,
    burnt: state.burnt + (penalty ? 1 : 0),
    status: lit === 0 ? 'lost' : 'playing',
  };
}

export function getRankTier(lit: number, burnt: number): RankTier {
  if (lit === 0) return 'defeat';
  if (burnt === 0) return 'perfect';
  return lit < burnt ? 'mostlyBurnt' : 'mostlyLit';
}
