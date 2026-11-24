import { type KeyboardEvent, useEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { areNamesValid, cleanName, getDuplicates } from "../game/names";
import { MAX_NAME_LENGTH, MAX_PLAYERS } from "../game/types";
import { useLocale } from "../locales";

interface Props {
  /** May contain blanks while the host is typing. */
  slots: readonly string[];
  onChange: (slots: string[]) => void;
  onRemove: (index: number) => void;
  onNext: () => void;
}

export function PlayersStep({ slots, onChange, onRemove, onNext }: Props) {
  const { t } = useLocale();
  const list = useRef<HTMLDivElement>(null);
  const duplicates = getDuplicates(slots);
  // The first slot is the host, who cannot be skipped.
  const names = slots.map(cleanName).filter(n => n !== "");

  // Focus the slot that was just added.
  const added = useRef(false);
  useEffect(() => {
    if (added.current) [...(list.current?.querySelectorAll("input") ?? [])].at(-1)?.focus();
    added.current = false;
  }, [slots.length]);

  const add = () => {
    if (slots.length === MAX_PLAYERS) return;
    added.current = true;
    onChange([...slots, ""]);
  };
  const onEnter = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    const next = list.current?.querySelectorAll("input")[index + 1];
    if (next) next.focus();
    else if (slots[index] && slots.length < MAX_PLAYERS) add();
    else e.currentTarget.blur();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-5 p-5 compact:gap-3 compact:py-3">
      <Logo />
      <div className="text-center">
        <h2 className="text-2xl font-extrabold">{t.setup.players}</h2>
        <p className="mt-1 text-base font-medium text-balance">{t.setup.playersHint}</p>
      </div>

      <div ref={list} className="grid grid-cols-2 gap-3 compact:gap-2">
        {slots.map((name, i) => {
          const isDuplicate = duplicates.includes(i);
          const tone = isDuplicate ? "bg-ember text-ink" : name ? "bg-paper text-ink" : "bg-night-deep text-paper";
          return (
            <div
              key={i}
              className={`chunky flex min-h-13 min-w-0 items-stretch focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-amber ${tone}`}
            >
              <input
                value={name}
                maxLength={MAX_NAME_LENGTH}
                placeholder={i === 0 ? t.setup.yourName : t.setup.name}
                aria-label={i === 0 ? t.setup.yourName : t.setup.name}
                aria-invalid={isDuplicate}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                enterKeyHint="next"
                className="w-full min-w-0 bg-transparent pl-2 text-base font-extrabold tracking-tight outline-none placeholder:text-paper/50"
                onChange={e => onChange(slots.map((n, j) => (j === i ? e.target.value : n)))}
                onKeyDown={e => onEnter(e, i)}
              />
              {i > 0 && (
                <button
                  type="button"
                  className="w-8 shrink-0 text-xl opacity-60"
                  aria-label={t.setup.remove(name || String(i + 1))}
                  onClick={() => onRemove(i)}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        {slots.length < MAX_PLAYERS && (
          <button
            type="button"
            className="min-h-13 rounded-[14px] border-3 border-dashed border-paper/40 px-2 text-base font-extrabold text-paper/70 active:text-paper"
            onClick={add}
          >
            + {t.setup.add}
          </button>
        )}
      </div>

      <p aria-live="polite" className="min-h-6 text-center text-base text-ember">
        {duplicates.length > 0 ? t.setup.duplicate : ""}
      </p>

      <Button
        tone="primary"
        className="sticky bottom-3 mt-auto min-h-16 w-full text-2xl disabled:opacity-100 disabled:bg-night-deep disabled:text-paper/40"
        disabled={!slots[0]?.trim() || !areNamesValid(names)}
        onClick={onNext}
      >
        {t.setup.next}
      </Button>
      <Footer className="-my-2" />
    </main>
  );
}
