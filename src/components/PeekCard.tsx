import { useEffect, useState } from 'react';
import { useLocale } from '../locales';
import { heatColor } from './heat';
import { HeatColumn } from './HeatColumn';

/** Shows the number only while held. Any interruption hides it again. */
export function PeekCard({ value, className = '' }: { value: number | undefined; className?: string }) {
  const { t } = useLocale();
  const [held, setHeld] = useState(false);
  const hide = () => setHeld(false);

  useEffect(() => {
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);

  if (value === undefined) {
    return (
      <div className={`chunky grid place-items-center bg-night-deep p-2 text-center text-base leading-tight text-balance ${className}`}>
        {t.peek.noCard}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`chunky relative touch-none bg-night-deep p-2 select-none [-webkit-touch-callout:none] ${className}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setHeld(true);
      }}
      onPointerUp={hide}
      onPointerCancel={hide}
      onLostPointerCapture={hide}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') setHeld(true);
      }}
      onKeyUp={hide}
      onBlur={hide}
    >
      {held ? (
        // Grows upwards over the screen when the card is low, so the finger does not cover the number.
        <span className="@container-size absolute -inset-x-[3px] -bottom-[3px] z-10 block h-[max(100%+6px,14rem)] rounded-[14px] border-3 border-ink bg-night-deep">
        <span className="flex h-full flex-col items-center justify-center gap-[4cqh] p-[4cqh]">
          <span
            className="text-[min(12rem,55cqh)] leading-none font-black"
            style={{ color: heatColor(value) }}
          >
            {value}
          </span>
          <HeatColumn value={value} className="h-[30cqh] w-full max-w-72" />
        </span>
        </span>
      ) : (
        <span className="block text-lg leading-tight font-extrabold text-balance">{t.peek.idle}</span>
      )}
    </button>
  );
}
