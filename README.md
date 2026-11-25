# Żarówki

Cooperative party game for 3-18 players (best for 6-9), phones in one room, no server.
It is a static PWA and works offline after the first visit.

## Rules

You play as one team. Keep as many żarówki (light bulbs) lit as you can over 5 rounds.

1. One player is the guesser. The host picks the first one, then the role moves clockwise.
2. Every player with a card holds it to see a secret number from 1 to 10.
3. Read the prompt. Each player with a card says or acts an answer that fits their number:
   1 is the weakest end of the scale (green), 10 is the strongest (red).
4. The guesser names players from the lowest number to the highest. The host opens their cards,
   with two taps each, so that a stray tap opens nothing.
5. If a number is lower than the one before it, a żarówka burns out. The first card is always safe,
   and equal numbers are fine.
6. If no żarówki are lit, the game is lost at once. Otherwise go to the next round: the host taps
   "Next round", everyone else taps the round number on their phone.

Each round has one prompt and up to two spares, picked with the arrows. Phones do not sync this choice,
so agree on it aloud. Each round starts with its first prompt.

### Difficulty

| Mode   | Lives | Does the guesser get a card? |
| :----- | :---- | :--------------------------- |
| Easy   | +1.2  | No                           |
| Normal | +0.7  | Yes                          |
| Hard   | +0.3  | Yes                          |
| Brutal | −0.1  | Yes                          |

A guesser with a card also answers and takes a place in the order. With up to 4 players the guesser always gets one.

Lives depend on the number of players. Start from the mistakes expected in a game when everyone has a card and each
number is misjudged by about 1 (normal error with that standard deviation; the guesser knows their own number),
fitted to a simulation: `0.115 × players × (players − 1)` up to 10 players, then `10.35 + 1.4 × (players − 10)`.
Add the "Lives" column times the square root of that and round to the nearest whole number. Each mode then gets at least
one life more than the next harder mode, and Brutal at least 1. The missing guesser card on Easy is not subtracted,
so Easy always has more lives and fewer cards. For such a table, with 5 or more players, the simulation loses
about 1–5% of games on Easy, 10–30% on Normal, 25–50% on Hard and 45–75% on Brutal. The 1 is an estimate:
lives based on 0.6 were too hard to win with.

| Players | Easy | Normal | Hard | Brutal |
| ------: | ---: | -----: | ---: | -----: |
|       3 |    4 |      3 |    2 |      1 |
|       4 |    4 |      3 |    2 |      1 |
|       5 |    5 |      4 |    3 |      2 |
|       6 |    6 |      5 |    4 |      3 |
|       7 |    8 |      7 |    6 |      5 |
|       8 |    9 |      8 |    7 |      6 |
|       9 |   12 |     10 |    9 |      8 |
|      12 |   18 |     16 |   14 |     13 |
|      18 |   27 |     25 |   23 |     21 |

Up to 10 cards have different numbers. Cards after the tenth come from a second 1–10 deck, so numbers can repeat.

### Result

| Żarówki at the end                | Result               |
| :-------------------------------- | :------------------- |
| None lit                          | Total darkness, loss |
| Fewer lit than burnt out          | Half-light           |
| At least as many lit as burnt out | Nice and bright!     |
| None burnt out                    | All żarówki lit!     |

## How it works

All devices derive the same game from one QR link: `?v=1a2b3c&seed=7392&n=1&g=2&c=normal&r=family-fun#<names>`.

| Part    | Meaning                                                 |
| :------ | :------------------------------------------------------ |
| `v`     | Game version, see [Versions](#versions)                 |
| `seed`  | Seed for the cards and the prompts                      |
| `n`     | Number of the game at this table, from 1                |
| `g`     | Place of the first guesser in the list of names, from 1 |
| `c`     | Difficulty: `easy`, `normal`, `hard`, `brutal`          |
| `r`     | Topics, one or more: `family`, `fun` (16+), `adult`     |
| `names` | URL-safe base64 of UTF-8, one name per line             |

- Names are in the URL fragment, so they are not sent to the hosting server. Base64 keeps the QR code small for Cyrillic.
- Names are unique, up to 12 characters, listed clockwise from the host. The host plays on the device that started the game.
- A link with any missing or invalid part is rejected: a half-read link would desync the table.
- Only the host device knows the opened cards and the lives. It keeps them in `localStorage`, so they survive a refresh.
  Other phones remember only their own seat and round.
- A joined player cannot change their name. They can set up a new game: their phone becomes the host device, and the others scan its code.
- Language and sound are set per device in the options and are not in the link. The sound is on at first. First choice of language: the saved one, then the browser languages, then English.
- Routes use query parameters only, because nested paths give 404 on GitHub Pages.

To play again, each device adds 1 to `n`: same players and settings, new cards, no scanning. The role of the guesser
moves on, and prompts continue in the same shuffled pool, so they repeat only when it runs out. Phones do not sync this:
a device shows "Game 2" and so on. A phone that is out of step scans the host's code and keeps its seat.

### Versions

All devices at a table must deal the same cards and prompts. `vite.config.ts` hashes the PRNG, the dealing code, the
types and the ids and ratings of the prompts into the version in the link. Other changes keep the version.

- A device with another version shows an update screen instead of a wrong game.
- The service worker downloads a new version in the background. It is used only on the setup and update screens, so
  a game in progress never changes. Returning to these screens checks for a new version again.
- A saved game of another version is dropped when the app is opened.

## Commands

    npm install
    npm run dev
    npm test
    npm run build

## Deploy

Set GitHub Pages source to "GitHub Actions" and push to `main`.
The workflow passes `/<repo-name>/` as `BASE_PATH`; `vite.config.ts` reads it.

## Layout

- `src/game` — pure rules: PRNG, dealing, lives, room link, board reducer, prompt markup, tests
- `src/locales` — typed dictionaries (English, Polish, Belarusian, Russian, Ukrainian) and locale context
- `src/data` — prompts per locale
- `src/audio` — which sound to play (pure, tested) and Web Audio playback
- `src/components`, `src/screens` — UI

## Prompts

Mark key words as `{{value:words}}`, where value is 1 (green) to 10 (red):

    Sneeze: from {{1:polite}} to {{10:roof-raising}}.

`{{guesser}}` becomes the name of the current guesser, also inside a mark. Every prompt marks at least its
1 and its 10. All packs must have the same ids and ratings in the same order, so that phones in different languages show the same prompt. Tests check both.

Polish and Belarusian prompts call the player «ty»/«ты» and never reveal their gender: use the present tense or an
impersonal form («ты знаходзіш», «табе трэба») instead of a past form.

Each prompt has an `id`, a `text` and a `rating`: `family`, `fun` (16+) or `adult` (18+). The host turns each topic on
or off. With fewer than 15 prompts (5 rounds × 3) for the selected topics, each round gets only one.

`family` has no dating, sex, alcohol, insults, or real violence and death.

## Add a language

1. Add `src/locales/<locale>.ts` and `src/data/prompts.<locale>.json`.
2. Add its loader and name in `src/locales/index.tsx`.

Each language is a separate file, loaded when it is used. The service worker caches all of them,
so switching also works offline after the first visit.

## Sounds

Each device plays its own sounds, as all players are in one room. They are synthesized, so there are no audio files.

- Host device: each opened card (higher number, higher note), a penalty, a flawless round, the loss, the result.
- All devices: a new round beeps as many times as its number, so the table hears a phone that is ahead.
- Options in the footer turn the sound off on this device. It is on by default. A phone with the sound off can look
  ahead in silence, so ask the table to keep it on.
- Sounds start in tap handlers only: browsers block others, and a refresh must not replay them.

## Visual style

- Mobile first, few groups per screen. A round should fit on one phone screen.
- Flat and tactile: 3px ink outline, 14px corners, hard `0 4px 0` shadow, no blur. Use the `chunky` and
  `pressable` utilities.
- Font: Rubik, 700–900, with Latin Extended and Cyrillic. Prompts must be readable at a glance.
- Colors are theme tokens in `src/index.css`:

| Token        | Usage                              |
| :----------- | :--------------------------------- |
| `night`      | App background                     |
| `night-deep` | Face-down cards, recessed areas    |
| `ink`        | Borders, shadows, text on paper    |
| `paper`      | Prompt cards, primary text         |
| `amber`      | Logo, main buttons, selected state |
| `ember`      | Penalty                            |

- Numbers 1–10 use the heat scale in `src/components/heat.ts`, from green to red. Bright shades are for bars and
  dark surfaces, dark shades for text on paper (at least 4.5:1 contrast).

## Status

Not built yet: card-flip animations, playtests.
