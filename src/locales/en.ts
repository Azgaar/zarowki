import type { Dictionary } from "./ru";

export { default as prompts } from "../data/prompts.en.json";

export const en: Dictionary = {
  title: "Żarówki",
  language: "Language",
  complexity: { easy: "Easy", normal: "Normal", hard: "Hard", brutal: "Brutal" },
  rating: { family: "Family", fun: "16+", adult: "18+" },
  lampsCount: n => `Lit żarówki: ${n}`,
  burntCount: n => `Burnt-out żarówki: ${n}`,
  intensity: n => `Brightness: ${n} out of 10`,
  setup: {
    players: "Who is playing?",
    playersHint: "Start with yourself, then go clockwise.",
    yourName: "Your name",
    name: "Name",
    add: "Player",
    remove: name => `Remove: ${name}`,
    duplicate: "Names must be different",
    next: "Next",
    back: "Back",
    first: "Who guesses first?",
    complexity: "Difficulty",
    rating: "Topics",
    start: "Start game"
  },
  board: {
    round: (r, total) => `Round ${r}/${total}`,
    qr: "QR",
    showQr: "Show QR code",
    closed: "Reveal card",
    tapAgain: "Tap again",
    next: "Next round",
    finish: "Results",
    penalty: "A żarówka burnt out!",
    lostTitle: "No żarówki left"
  },
  newGame: {
    action: "New game",
    confirm: "Start a new game?",
    again: "Play again",
    againHint: "Same players and settings, no new QR code. Everyone taps “Play again” on their phone.",
    others: "Everyone else taps “New game”, then “Play again”.",
    setup: "New setup",
    host: "Or set up a new game. Everyone scans a new QR code.",
    player: "Or set up a new game. Everyone else scans your QR code.",
    cancel: "Cancel"
  },
  rules: {
    action: "Rules",
    title: "How to play",
    close: "Got it",
    steps: [
      "You play as one team. Keep as many żarówki lit as you can over 5 rounds.",
      "One player guesses each round. The role moves clockwise.",
      "Hold your card to see your secret number from 1 to 10. Do not tell anyone.",
      "Read the prompt and give an answer that fits your number: 1 is the weakest end of the scale (green), 10 is the strongest (red).",
      "The guesser names players in order, from the lowest number to the highest. The host opens their cards with two taps.",
      "If a number is lower than the one before it, a żarówka burns out. Equal numbers are fine.",
      "If every żarówka burns out, you lose. If you reach the end, see how many are still lit.",
      "The difficulty sets the number of żarówki and whether the guesser gets a card. A guesser with a card also answers and takes a place in the order.",
      "At the start of a round, everyone switches the round number on their phone. If you do not like a prompt, pick another with the arrows: everyone needs the same one.",
      "To play again, everyone taps “New game”, then “Play again”: there is no need to scan a new code."
    ]
  },
  options: {
    action: "Options",
    sound: "Sound",
    on: "On",
    off: "Off",
    close: "Done"
  },
  qr: {
    title: "Scan to join",
    close: "Close"
  },
  join: {
    title: "Who are you?",
    confirm: name => `I’m ${name}`
  },
  game: n => `Game ${n}`,
  roundPills: "Round",
  role: {
    you: "You",
    guesser: "Guesser",
    youGuess: "Guesser"
  },
  peek: {
    idle: "Hold to see your number",
    noCard: "You have no card this round: listen and put the answers in order."
  },
  prompt: {
    previous: "Previous prompt",
    next: "Next prompt",
    empty: "There are no prompts for this set."
  },
  rank: {
    defeat: { title: "Total darkness", text: "Every żarówka burnt out. One more try?" },
    mostlyBurnt: { title: "Half-light", text: "More żarówki burnt out than not, but you made it to the end." },
    mostlyLit: { title: "Nice and bright!", text: "At least half the żarówki are still lit. Great team!" },
    perfect: { title: "All żarówki lit!", text: "Not a single żarówka burnt out. Perfect!" }
  },
  error: {
    badLink: "This room link is broken. Scan the QR code again.",
    version: "This QR code is from another version of the game.",
    update: "Update",
    hostVersion: "If this does not help, the host’s phone has the old version: the host taps “New game”, then “New setup”, and shows the new QR code.",
    home: "Go to start"
  }
};
