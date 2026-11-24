export const COMPLEXITIES = ['easy', 'normal', 'hard', 'brutal'] as const;
export type Complexity = (typeof COMPLEXITIES)[number];

export const RATINGS = ['family', 'fun', 'adult'] as const;
export type ContentRating = (typeof RATINGS)[number];

export interface PromptItem {
  id: string;
  text: string;
  rating: ContentRating;
}

/** Everything a device needs to derive the whole game. Encoded in the QR code. */
export interface Room {
  seed: number;
  /** Clockwise, starting with the host. A seat is a 1-based index here. */
  names: string[];
  /** Seat of the first guesser. */
  first: number;
  complexity: Complexity;
  /** Topics in use: at least one, in the order of RATINGS. */
  ratings: ContentRating[];
  /** Counts up with every "Play again", from 1. */
  game: number;
}

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 18;
export const MAX_NAME_LENGTH = 12;
/** The device that starts the game belongs to the first player in the list. */
export const HOST_SEAT = 1;
export const ROUNDS = 5;
export const MAX_GAME = 999;
export const PROMPTS_PER_ROUND = 3;
