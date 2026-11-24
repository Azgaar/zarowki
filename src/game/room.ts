import { isInteger } from './isInteger';
import { areNamesValid, decodeNames, encodeNames } from './names';
import { COMPLEXITIES, MAX_GAME, RATINGS, type Complexity, type ContentRating, type Room } from './types';
import { VERSION } from './version';

function parseInteger(value: string | null): number | null {
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : null;
}

/** "family-adult" -> topics. Null unless it is a non-empty subset in the order of RATINGS, so that equal rooms have equal links. */
function parseRatings(value: string | null): ContentRating[] | null {
  const ratings = RATINGS.filter((r) => value?.split('-').includes(r));
  return ratings.length > 0 && ratings.join('-') === value ? ratings : null;
}

/** The link was made by a device that deals other cards or prompts. */
export function isOtherVersion(search: string): boolean {
  const version = new URLSearchParams(search).get('v');
  return version !== null && version !== VERSION;
}

/** Null when any part is missing or invalid: a half-read link would desync the table. */
export function parseRoom(search: string, hash: string): Room | null {
  const params = new URLSearchParams(search);
  const seed = parseInteger(params.get('seed'));
  const first = parseInteger(params.get('g'));
  const complexity = params.get('c') as Complexity;
  const ratings = parseRatings(params.get('r'));
  const game = parseInteger(params.get('n'));
  const names = decodeNames(hash.replace(/^#/, ''));
  if (params.get('v') !== VERSION) return null;
  if (seed === null || names === null || ratings === null || !isInteger(game, 1, MAX_GAME) || !isInteger(first, 1, names.length)) return null;
  if (!COMPLEXITIES.includes(complexity)) return null;
  return { seed, names, first, complexity, ratings, game };
}

export function hasRoomParams(search: string): boolean {
  return new URLSearchParams(search).has('seed');
}

/** Names go in the fragment, which browsers do not send to the hosting server. */
export function roomToLink({ seed, names, first, complexity, ratings, game }: Room): string {
  return `?v=${VERSION}&seed=${seed}&n=${game}&g=${first}&c=${complexity}&r=${ratings.join('-')}#${encodeNames(names)}`;
}

/** Checks a room read from storage. */
export function checkRoom(room: Room): Room | null {
  if (!Array.isArray(room.names) || !room.names.every((n) => typeof n === 'string') || !areNamesValid(room.names)) return null;
  if (!Array.isArray(room.ratings)) return null;
  const [search, hash] = roomToLink(room).split('#');
  return parseRoom(search!, hash!);
}

export function roomKey(room: Room): string {
  return roomToLink(room).slice(1);
}

/** The same for every game of the table, so a player picks a name only once. */
export function tableKey(room: Room): string {
  return roomKey({ ...room, game: 1 });
}

/** Every device works out the next game by itself, so nobody scans a new code. */
export function nextGame(room: Room): Room {
  return { ...room, game: room.game < MAX_GAME ? room.game + 1 : 1 };
}

export function getJoinUrl(room: Room): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}${roomToLink(room)}`;
}

/** The same table as seen by a new host: they become the first seat, the circle stays the same. */
export function seatHostFirst(room: Room, seat: number): Pick<Room, 'names' | 'first'> {
  const count = room.names.length;
  return {
    names: [...room.names.slice(seat - 1), ...room.names.slice(0, seat - 1)],
    first: ((room.first - seat + count) % count) + 1,
  };
}

/** Large enough that a group does not meet an old game, whose seat and round their phones remember. */
export function randomSeed(): number {
  return 100_000 + Math.floor(Math.random() * 900_000);
}
