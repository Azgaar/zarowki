import { describe, expect, it } from 'vitest';
import { loadLocale, LOCALE_KEYS, pickLocale, type Locale } from '../locales';
import { boardReducer, createBoard, getRankTier, restoreBoard, type BoardState } from './board';
import { parsePromptText } from './promptText';
import { areNamesValid, cleanName, decodeNames, encodeNames, getDuplicates } from './names';
import { checkRoom, isOtherVersion, nextGame, parseRoom, roomToLink, seatHostFirst, tableKey } from './room';
import {
  dealRound,
  filterPrompts,
  getAnsweringSeats,
  getGuesser,
  getRoundPrompts,
  getStartingLamps,
  guesserGetsCard,
} from './seededDeal';
import { COMPLEXITIES, MAX_PLAYERS, MIN_PLAYERS, RATINGS, ROUNDS, type Room } from './types';
import { VERSION } from './version';

const locales = LOCALE_KEYS;
const LOCALES = Object.fromEntries(
  await Promise.all(locales.map(async (locale) => [locale, await loadLocale(locale)] as const)),
) as Record<Locale, Awaited<ReturnType<typeof loadLocale>>>;
const items = LOCALES.ru.prompts;
const people = (n: number) => Array.from({ length: n }, (_, i) => `Player ${i + 1}`);
const room = (over: Partial<Room> = {}): Room => ({
  seed: 7392,
  names: people(8),
  first: 1,
  complexity: 'normal',
  ratings: ['family', 'fun'],
  game: 1,
  ...over,
});
const rounds = Array.from({ length: ROUNDS }, (_, i) => i + 1);

describe('lives', () => {
  it.each([
    [3, 'easy', 1],
    [3, 'brutal', 1],
    [6, 'normal', 2],
    [8, 'normal', 4],
    [9, 'normal', 5],
    [8, 'hard', 3],
    [8, 'brutal', 2],
    [18, 'normal', 14],
  ] as const)('%i players, %s -> %i', (n, c, expected) => {
    expect(getStartingLamps(n, c)).toBe(expected);
  });
  it('never gives a harder mode, or a smaller table, more lives', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      const lives = COMPLEXITIES.map((c) => getStartingLamps(n, c));
      expect(lives).toEqual([...lives].sort((a, b) => b - a));
    }
    for (const c of COMPLEXITIES)
      for (let n = MIN_PLAYERS; n < MAX_PLAYERS; n++)
        expect(getStartingLamps(n + 1, c)).toBeGreaterThanOrEqual(getStartingLamps(n, c));
  });
});

describe('guesser', () => {
  it('rotates clockwise and wraps', () => {
    const guessers = (first: number) => rounds.map((r) => getGuesser(room({ names: people(3), first }), r));
    expect(guessers(1)).toEqual([1, 2, 3, 1, 2]);
    expect(guessers(3)).toEqual([3, 1, 2, 3, 1]);
    expect(getGuesser(nextGame(room({ names: people(3) })), 1)).toBe(3);
  });
  it('follows the card rule per mode', () => {
    expect(guesserGetsCard(8, 'normal')).toBe(true);
    expect(guesserGetsCard(9, 'normal')).toBe(true);
    expect(guesserGetsCard(5, 'easy')).toBe(false);
    expect(guesserGetsCard(15, 'hard')).toBe(true);
    expect(guesserGetsCard(15, 'brutal')).toBe(true);
    for (const c of COMPLEXITIES) expect(guesserGetsCard(4, c)).toBe(true);
  });
});

describe('dealing', () => {
  it('is stable: changing this breaks rooms shared between app versions', () => {
    expect([...dealRound(room(), 1).values()]).toEqual([...dealRound(room(), 1).values()]);
    expect([...dealRound(room(), 1).values()]).toMatchInlineSnapshot(`
      [
        9,
        3,
        5,
        1,
        6,
        7,
        8,
        10,
      ]
    `);
  });
  it('deals valid hands for every size, mode and round', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++)
      for (const complexity of COMPLEXITIES)
        for (const round of rounds) {
          const r = room({ names: people(n), complexity });
          const deal = dealRound(r, round);
          const values = [...deal.values()];
          expect([...deal.keys()]).toEqual(getAnsweringSeats(r, round));
          expect(values.every((v) => v >= 1 && v <= 10)).toBe(true);
          const first = values.slice(0, 10);
          const second = values.slice(10);
          expect(new Set(first).size).toBe(first.length);
          expect(new Set(second).size).toBe(second.length);
        }
  });
});

describe('prompts', () => {
  it('uses only the chosen topics, and each has enough for a game', () => {
    for (const r of RATINGS) {
      const pool = filterPrompts(items, [r]);
      expect(pool.length).toBeGreaterThanOrEqual(15);
      expect(pool.every((p) => p.rating === r)).toBe(true);
    }
    expect(filterPrompts(items, RATINGS)).toHaveLength(items.length);
  });
  it('does not repeat a prompt in the next games, and deals new cards', () => {
    let r = room();
    const ids: string[] = [];
    for (let game = 0; game < 10; game++, r = nextGame(r))
      ids.push(...rounds.flatMap((round) => getRoundPrompts(items, r, round).map((p) => p.id)));
    expect(new Set(ids).size).toBe(150);
    expect([...dealRound(nextGame(room()), 1)]).not.toEqual([...dealRound(room(), 1)]);
  });
  it('has unique ids', () => {
    expect(new Set(items.map((p) => p.id)).size).toBe(items.length);
  });
  it('never repeats a prompt within a game', () => {
    const ids = rounds.flatMap((r) => getRoundPrompts(items, room(), r).map((p) => p.id));
    expect(ids).toHaveLength(15);
    expect(new Set(ids).size).toBe(15);
  });
  it('drops to one prompt per round in a small pool', () => {
    for (const r of rounds) expect(getRoundPrompts(items.slice(0, 14), room(), r)).toHaveLength(1);
    expect(getRoundPrompts([], room(), 1)).toEqual([]);
  });
});

describe('prompt markup', () => {
  it('splits plain and valued text', () => {
    expect(parsePromptText('From {{1:trash}} to {{10:treasure}}?', 'Аня')).toEqual([
      { text: 'From ' },
      { text: 'trash', value: 1 },
      { text: ' to ' },
      { text: 'treasure', value: 10 },
      { text: '?' },
    ]);
    expect(parsePromptText('plain', 'Аня')).toEqual([{ text: 'plain' }]);
  });
  it('puts the guesser name in, also inside a marker, whatever the name is', () => {
    const text = '{{guesser}}: {{1:not {{guesser}}}}';
    expect(parsePromptText(text, 'Аня')).toEqual([{ text: 'Аня: ' }, { text: 'not Аня', value: 1 }]);
    expect(parsePromptText(text, '$&{{1:x}}')[0]).toEqual({ text: '$&{{1:x}}: ' });
  });
  it('leaves values off the scale as text', () => {
    expect(parsePromptText('{{0:a}}{{11:b}}', 'Аня')).toEqual([{ text: '{{0:a}}{{11:b}}' }]);
  });
  it.each(locales)('%s prompts are all marked with 1 and 10', (locale) => {
    for (const { id, text } of LOCALES[locale].prompts) {
      const segments = parsePromptText(text, 'Аня');
      const values = segments.map((s) => s.value);
      expect(values, id).toContain(1);
      expect(values, id).toContain(10);
      expect(segments.map((s) => s.text).join(''), id).not.toMatch(/[{}]/);
    }
  });
});

describe('locales', () => {
  it.each(locales)('%s pack deals the same prompts as the others', (locale) => {
    const shape = LOCALES[locale].prompts.map(({ id, rating }) => [id, rating]);
    expect(shape).toEqual(items.map(({ id, rating }) => [id, rating]));
  });
  it('picks saved, then browser, then English', () => {
    expect(pickLocale('pl', ['ru-RU'])).toBe('pl');
    expect(pickLocale(null, ['de-DE', 'ru-RU', 'en'])).toBe('ru');
    expect(pickLocale(null, ['be-BY', 'ru'])).toBe('be');
    expect(pickLocale(null, ['uk-UA', 'ru'])).toBe('uk');
    expect(pickLocale('xx', ['de'])).toBe('en');
  });
});

describe('board', () => {
  const seatsByValue = (s: BoardState, dir: 1 | -1) =>
    [...dealRound(s.room, s.round)].sort((a, b) => dir * (a[1] - b[1])).map(([seat]) => seat);
  const play = (s: BoardState, seats: number[]) =>
    seats.reduce((acc, seat) => boardReducer(acc, { type: 'reveal', seat }), s);

  it('wins perfectly with every seat in order, ties included', () => {
    let s = createBoard(room({ names: people(18), complexity: 'hard' }));
    for (const _ of rounds) s = boardReducer(play(s, seatsByValue(s, 1)), { type: 'next' });
    expect(s.status).toBe('finished');
    expect(getRankTier(s.lit, s.burnt)).toBe('perfect');
  });
  it('loses at zero and ignores later actions', () => {
    const s = createBoard(room({ complexity: 'brutal' }));
    const lost = play(s, seatsByValue(s, -1));
    expect(lost).toMatchObject({ status: 'lost', lit: 0, burnt: 2 });
    expect(lost.reveals).toHaveLength(3);
    expect(boardReducer(lost, { type: 'next' })).toBe(lost);
  });
  it('ignores repeat reveals and early advance', () => {
    const once = play(createBoard(room()), [3]);
    expect(play(once, [3])).toBe(once);
    expect(boardReducer(once, { type: 'next' })).toBe(once);
  });
  it('restores a saved board and drops a damaged one', () => {
    const s = play(createBoard(room()), [3, 4]);
    expect(restoreBoard(JSON.parse(JSON.stringify(s)))).toEqual(s);
    for (const bad of [null, 1, {}, { ...s, version: 'old' }, { ...s, round: 6 }, { ...s, room: {} }, { ...s, reveals: [null] }])
      expect(restoreBoard(bad)).toBeNull();
  });
  it('ranks by ratio', () => {
    expect([getRankTier(0, 4), getRankTier(1, 3), getRankTier(2, 2), getRankTier(4, 0)]).toEqual([
      'defeat',
      'mostlyBurnt',
      'mostlyLit',
      'perfect',
    ]);
  });
});

describe('names', () => {
  const cyrillic = ['Ая', 'Zażółć', 'Ёжик 🦔', 'Jo'];
  it('round-trips any alphabet, URL-safe', () => {
    expect(decodeNames(encodeNames(cyrillic))).toEqual(cyrillic);
    expect(encodeNames(cyrillic)).toMatch(/^[\w-]+$/);
  });
  it('drops invisible characters and extra spaces', () => {
    expect(cleanName('  Аня \uD83E  Б ')).toBe('Аня Б');
    expect(cleanName('🦔')).toBe('🦔');
    expect(cleanName('\u200B\u0000')).toBe('');
    expect(areNamesValid(['A\u0000', 'B', 'C'])).toBe(false);
  });
  it('finds duplicates regardless of case and spaces', () => {
    expect(getDuplicates(['Аня', 'Боря', ' аня ', '', ''])).toEqual([2]);
  });
  it.each([[[]], [['']], [[' Аня', 'B', 'C']], [['Аня', 'аня', 'B']], [['x'.repeat(13), 'B', 'C']], [people(2)], [people(19)]])('rejects %j', (names) => {
    expect(areNamesValid(names)).toBe(false);
  });
  it.each(['', '!', 'gICA', encodeNames(['a', 'A', 'b'])])('does not decode %j', (text) => {
    expect(decodeNames(text)).toBeNull();
  });
});

describe('room link', () => {
  const tail = `#${encodeNames(people(8))}`;
  const parse = (link: string) => {
    const at = link.indexOf('#');
    return at < 0 ? parseRoom(link, '') : parseRoom(link.slice(0, at), link.slice(at));
  };
  it('round-trips and keeps names out of the query', () => {
    const r = room({ names: ['Аня', 'Боря', 'Вера'], first: 2, game: 3 });
    expect(roomToLink(r)).toMatch(/^\?v=\w{6}&seed=7392&n=3&g=2&c=normal&r=family-fun#[\w-]+$/);
    expect(parse(roomToLink(r))).toEqual(r);
    expect(checkRoom(r)).toEqual(r);
  });
  const good = `?v=${VERSION}&seed=1&n=1&g=1&c=normal&r=fun`;
  it('rejects a link with any missing or invalid part', () => {
    expect(parse(good + tail)).not.toBeNull();
    const bad = [['v=' + VERSION, 'v=old'], ['seed=1', 'seed=x'], ['n=1', 'n=0'], ['g=1', 'g=9'], ['g=1', 'g=0'],
      ['c=normal', 'c=wat'], ['r=fun', 'r=wat'], ['r=fun', 'r='], ['r=fun', 'r=fun-family'], ['r=fun', 'r=fun-fun']];
    for (const [from, to] of bad) expect(parse(good.replace(from!, to!) + tail), to).toBeNull();
    for (const link of ['', '?seed=1', good, good.replace(/v=\w+&/, '') + tail]) expect(parse(link), link).toBeNull();
  });
  it('tells another version from a broken link', () => {
    expect([isOtherVersion('?v=old&seed=1'), isOtherVersion(good), isOtherVersion('?seed=1')]).toEqual([true, false, false]);
  });
  it('keeps the table, and so the seats, in the next game', () => {
    const r = room();
    expect(tableKey(nextGame(r))).toBe(tableKey(r));
    expect(roomToLink(nextGame(r))).not.toBe(roomToLink(r));
  });
  it('moves a new host to the front without changing the circle', () => {
    const r = room({ names: ['A', 'B', 'C', 'D'], first: 2 });
    expect(seatHostFirst(r, 3)).toEqual({ names: ['C', 'D', 'A', 'B'], first: 4 });
    expect(seatHostFirst(r, 1)).toEqual({ names: r.names, first: 2 });
  });
});
