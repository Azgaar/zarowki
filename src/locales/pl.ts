import type { Dictionary } from "./ru";

export { default as prompts } from "../data/prompts.pl.json";

export const pl: Dictionary = {
  title: "Żarówki",
  language: "Język",
  complexity: { easy: "Łatwy", normal: "Normalny", hard: "Trudny", brutal: "Hardkor" },
  rating: { family: "Rodzinne", fun: "16+", adult: "18+" },
  lampsCount: n => `Świecące żarówki: ${n}`,
  burntCount: n => `Przepalone żarówki: ${n}`,
  intensity: n => `Jasność: ${n} na 10`,
  setup: {
    players: "Kto gra?",
    playersHint: "Zacznij od siebie, dalej zgodnie z ruchem wskazówek zegara.",
    yourName: "Twoje imię",
    name: "Imię",
    add: "Gracz",
    remove: name => `Usuń: ${name}`,
    duplicate: "Imiona nie mogą się powtarzać",
    next: "Dalej",
    back: "Wstecz",
    first: "Kto zgaduje jako pierwszy?",
    complexity: "Poziom trudności",
    rating: "Tematy",
    start: "Zacznij grę"
  },
  board: {
    round: (r, total) => `Runda ${r}/${total}`,
    qr: "QR",
    showQr: "Pokaż kod QR",
    closed: "Odkryj kartę",
    tapAgain: "Jeszcze raz",
    next: "Następna runda",
    finish: "Wyniki",
    penalty: "Żarówka się przepaliła!",
    lostTitle: "Nie ma już żarówek"
  },
  newGame: {
    action: "Nowa gra",
    confirm: "Rozpocząć nową grę?",
    again: "Zagraj ponownie",
    againHint: "Ci sami gracze i te same ustawienia, bez nowego kodu QR. Wszyscy dotykają „Zagraj ponownie” na swoim telefonie.",
    others: "Pozostali dotykają „Nowa gra”, a potem „Zagraj ponownie”.",
    setup: "Nowe ustawienia",
    host: "Albo ustaw nową grę. Wszyscy zeskanują nowy kod QR.",
    player: "Albo ustaw nową grę. Pozostali zeskanują twój kod QR.",
    cancel: "Anuluj"
  },
  rules: {
    action: "Zasady",
    title: "Zasady gry",
    close: "Jasne",
    steps: [
      "Gracie jako jedna drużyna. Przez 5 rund utrzymajcie jak najwięcej świecących żarówek.",
      "W każdej rundzie zgaduje jedna osoba. Rola przechodzi zgodnie z ruchem wskazówek zegara.",
      "Przytrzymaj kartę, aby zobaczyć swoją tajną liczbę od 1 do 10. Nikomu jej nie zdradzaj.",
      "Przeczytaj zadanie i daj odpowiedź pasującą do swojej liczby: 1 to najsłabszy koniec skali (zielony), 10 to najmocniejszy (czerwony).",
      "Osoba zgadująca wymienia graczy po kolei, od najmniejszej liczby do największej. Gospodarz odkrywa ich karty dwoma dotknięciami.",
      "Jeśli liczba jest mniejsza od poprzedniej, jedna żarówka się przepala. Równe liczby to nie błąd.",
      "Gdy przepalą się wszystkie żarówki, przegrywacie. Jeśli dotrwacie do końca, sprawdźcie, ile jeszcze świeci.",
      "Poziom trudności określa liczbę żarówek i to, czy osoba zgadująca dostaje kartę. Jeśli ją dostaje, też odpowiada i ustawia siebie w kolejności.",
      "Na początku rundy wszyscy przełączają numer rundy na swoim telefonie. Jeśli zadanie wam nie odpowiada, wybierzcie inne strzałkami: wszyscy muszą mieć to samo.",
      "Aby zagrać jeszcze raz, wszyscy dotykają „Nowa gra”, a potem „Zagraj ponownie”: nie trzeba skanować nowego kodu."
    ]
  },
  options: {
    action: "Opcje",
    sound: "Dźwięk",
    on: "Wł.",
    off: "Wył.",
    close: "Gotowe"
  },
  qr: {
    title: "Zeskanuj, aby dołączyć",
    close: "Zamknij"
  },
  join: {
    title: "Kim jesteś?",
    confirm: name => `Ja: ${name}`
  },
  game: n => `Gra ${n}`,
  roundPills: "Runda",
  role: {
    you: "Ty",
    guesser: "Zgaduje",
    youGuess: "Zgadujesz"
  },
  peek: {
    idle: "Przytrzymaj, aby zobaczyć liczbę",
    noCard: "W tej rundzie nie masz karty: słuchaj i ustaw odpowiedzi w kolejności."
  },
  prompt: {
    previous: "Poprzednie zadanie",
    next: "Następne zadanie",
    empty: "Brak zadań dla tego zestawu."
  },
  rank: {
    defeat: { title: "Zupełna ciemność", text: "Wszystkie żarówki się przepaliły. Jeszcze raz?" },
    mostlyBurnt: { title: "Półmrok", text: "Więcej żarówek się przepaliło, ale udało się dotrwać do końca." },
    mostlyLit: { title: "Jasno!", text: "Co najmniej połowa żarówek wciąż świeci. Świetna drużyna!" },
    perfect: { title: "Wszystkie żarówki świecą!", text: "Ani jednej przepalonej żarówki. Idealnie!" }
  },
  error: {
    badLink: "Link do pokoju jest uszkodzony. Zeskanuj kod QR jeszcze raz.",
    version: "Ten kod QR pochodzi z innej wersji gry.",
    update: "Zaktualizuj",
    hostVersion: "Jeśli to nie pomoże, stara wersja jest na telefonie gospodarza: niech wybierze „Nowa gra”, potem „Nowe ustawienia” i pokaże nowy kod QR.",
    home: "Na stronę główną"
  }
};
