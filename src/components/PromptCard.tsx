import { useMemo, useState } from 'react';
import { getGuesser, getRoundPrompts } from '../game/seededDeal';
import type { Room } from '../game/types';
import { useLocale } from '../locales';
import { PromptText } from './PromptText';

/** Long prompts get smaller text, so that the cards below stay on the screen. */
function textSize(length: number): string {
  if (length > 190) return 'text-sm sm:text-base lg:text-2xl';
  if (length > 140) return 'text-base sm:text-lg lg:py-2 lg:text-3xl';
  return 'text-lg sm:text-xl lg:py-4 lg:text-4xl';
}

/** Render with key={round} so the index resets to the first prompt. */
export function PromptCard({ room, round }: { room: Room; round: number }) {
  const { t, prompts } = useLocale();
  const options = useMemo(() => getRoundPrompts(prompts, room, round), [prompts, room, round]);
  const [index, setIndex] = useState(0);
  const text = options[index]?.text ?? t.prompt.empty;
  const guesser = room.names[getGuesser(room, round) - 1]!;
  const turn = (by: number) => setIndex((i) => (i + by + options.length) % options.length);
  const arrow = 'grid size-11 place-items-center text-base text-ink/60 active:text-ink';

  return (
    <section className="chunky bg-paper px-3 pt-3 text-center text-ink">
      <p className={`leading-snug text-balance ${textSize(text.length)}`}>
        <PromptText text={text} guesser={guesser} />
      </p>
      {options.length > 1 && (
        <div className="flex items-center justify-center text-sm text-ink/60">
          <button type="button" className={arrow} aria-label={t.prompt.previous} onClick={() => turn(-1)}>◀</button>
          <span className="tabular-nums">{index + 1}/{options.length}</span>
          <button type="button" className={arrow} aria-label={t.prompt.next} onClick={() => turn(1)}>▶</button>
        </div>
      )}
    </section>
  );
}
