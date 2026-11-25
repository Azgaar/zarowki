import { createRng, shuffle } from './prng';
import {
  COMPLEXITIES,
  PROMPTS_PER_ROUND,
  ROUNDS,
  type Complexity,
  type ContentRating,
  type PromptItem,
  type Room,
} from './types';

/** Lives above or below the expected mistakes, in units of their spread. */
const MARGIN: Record<Complexity, number> = {
  easy: 1.2,
  normal: 0.7,
  hard: 0.3,
  brutal: -0.1,
};

/** Up to this many players the guesser always has a card: fewer cards leave almost nothing to order. */
const SMALL_TABLE = 4;

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/**
 * Mistakes per game when everyone has a card and each number is misjudged by about 1, fitted to a simulation:
 * 7 players make about 5.
 * Grows with the pairs of cards that can be swapped. After the tenth card, numbers repeat and it grows slower.
 */
function expectedMistakes(players: number): number {
  return players <= 10 ? 0.115 * players * (players - 1) : 10.35 + 1.4 * (players - 10);
}

/**
 * Lives at the start of the game. Each mode has at least one more than the next harder one.
 * They follow the number of players, so the missing guesser card on Easy only helps.
 */
export function getStartingLamps(playerCount: number, complexity: Complexity): number {
  const mistakes = expectedMistakes(playerCount);
  const harder = COMPLEXITIES[COMPLEXITIES.indexOf(complexity) + 1];
  const floor = harder ? getStartingLamps(playerCount, harder) + 1 : 1;
  return Math.max(floor, Math.round(mistakes + MARGIN[complexity] * Math.sqrt(mistakes)));
}

/** Rounds played at this table before the given one, from 0. */
function getRoundIndex(room: Room, round: number): number {
  return (room.game - 1) * ROUNDS + round - 1;
}

/** The host picks the first guesser, then the role moves clockwise, also from one game to the next. */
export function getGuesser(room: Room, round: number): number {
  return ((room.first - 1 + getRoundIndex(room, round)) % room.names.length) + 1;
}

export function guesserGetsCard(playerCount: number, complexity: Complexity): boolean {
  return playerCount <= SMALL_TABLE || complexity !== 'easy';
}

export function getAnsweringSeats(room: Room, round: number): number[] {
  const seats = Array.from({ length: room.names.length }, (_, i) => i + 1);
  if (guesserGetsCard(room.names.length, room.complexity)) return seats;
  const guesser = getGuesser(room, round);
  return seats.filter((seat) => seat !== guesser);
}

/** Seat -> secret number. Seats without a card this round are absent. */
export function dealRound(room: Room, round: number): Map<number, number> {
  const firstDeck = shuffle(SCALE, createRng(`${room.seed}:${room.game}:deal:${round}:a`));
  const secondDeck = shuffle(SCALE, createRng(`${room.seed}:${room.game}:deal:${round}:b`));
  const deck = [...firstDeck, ...secondDeck];
  return new Map(getAnsweringSeats(room, round).map((seat, i) => [seat, deck[i]!]));
}

export function filterPrompts(prompts: readonly PromptItem[], ratings: readonly ContentRating[]): PromptItem[] {
  return prompts.filter((p) => ratings.includes(p.rating));
}

/**
 * Up to 3 prompts for the round, or 1 when the pool cannot fill every round with 3.
 * The next game goes on from the same shuffled pool, so prompts repeat only when it runs out.
 */
export function getRoundPrompts(
  prompts: readonly PromptItem[],
  room: Room,
  round: number,
): PromptItem[] {
  const pool = filterPrompts(prompts, room.ratings);
  if (pool.length === 0) return [];
  const order = shuffle(pool, createRng(`${room.seed}:prompts`));
  const perRound = pool.length >= ROUNDS * PROMPTS_PER_ROUND ? PROMPTS_PER_ROUND : 1;
  const start = getRoundIndex(room, round) * perRound;
  return Array.from({ length: perRound }, (_, i) => order[(start + i) % order.length]!);
}
