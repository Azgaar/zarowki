import { Bulb } from "../components/Bulb";
import { Button } from "../components/Button";
import { Footer } from "../components/Footer";
import { FooterLink } from "../components/FooterLink";
import { NamePicker } from "../components/NamePicker";
import { getStartingLamps } from "../game/seededDeal";
import { COMPLEXITIES, RATINGS, type ContentRating, type Room } from "../game/types";
import { useLocale } from "../locales";

export type Setup = Omit<Room, "seed" | "game">;

interface Props {
  setup: Setup;
  onChange: (patch: Partial<Setup>) => void;
  onBack: () => void;
  onStart: () => void;
}

export function RulesStep({ setup, onChange, onBack, onStart }: Props) {
  const { t } = useLocale();
  const { names, first, complexity, ratings } = setup;
  const tone = (selected: boolean) => (selected ? "primary" : "dark");

  // The last topic stays on.
  const toggle = (rating: ContentRating) => {
    const next = RATINGS.filter(r => (r === rating) !== ratings.includes(r));
    if (next.length > 0) onChange({ ratings: next });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-between gap-5 p-5 compact:gap-3 compact:py-3">
      <section>
        <h2 className="mb-2 text-lg">{t.setup.first}</h2>
        <NamePicker
          names={names}
          selected={first}
          onSelect={seat => onChange({ first: seat })}
          tone="dark"
          className={names.length <= 4 ? "grid-cols-2" : "grid-cols-3"}
          tileClassName="min-h-11 text-base"
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg">{t.setup.complexity}</h2>
        <div className="grid grid-cols-2 gap-3 compact:gap-2">
          {COMPLEXITIES.map(c => {
            const lamps = getStartingLamps(names.length, c);
            return (
              <Button
                key={c}
                tone={tone(c === complexity)}
                aria-pressed={c === complexity}
                aria-label={`${t.complexity[c]}. ${t.lampsCount(lamps)}`}
                className="flex min-h-16 items-center justify-between gap-1 text-base compact:min-h-14 max-[359px]:px-2 max-[359px]:text-sm sm:text-lg"
                onClick={() => onChange({ complexity: c })}
              >
                {t.complexity[c]}
                <span className="flex items-center gap-1 tabular-nums">
                  {lamps}
                  <Bulb lit onAmber={c === complexity} className="h-6 max-[359px]:h-5" />
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg">{t.setup.rating}</h2>
        <div className="grid grid-cols-3 gap-3 compact:gap-2">
          {RATINGS.map(r => (
            <Button
              key={r}
              tone={tone(ratings.includes(r))}
              aria-pressed={ratings.includes(r)}
              className="px-0 text-sm max-[359px]:text-xs sm:text-base"
              onClick={() => toggle(r)}
            >
              {t.rating[r]}
            </Button>
          ))}
        </div>
      </section>

      <Button tone="primary" className="min-h-16 w-full text-2xl" onClick={onStart}>
        {t.setup.start}
      </Button>
      <Footer className="-my-2">
        <FooterLink onClick={onBack}>{t.setup.back}</FooterLink>
      </Footer>
    </main>
  );
}
