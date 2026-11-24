import { type Locale, LOCALE_NAMES, useLocale } from "../locales";

export function LanguageSelect({ className = "", labelClassName = "sr-only" }: { className?: string; labelClassName?: string }) {
  const { t, locale, setLocale } = useLocale();
  return (
    <label className={`relative flex items-center has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-amber ${className}`}>
      <span className={labelClassName}>{t.language}</span>
      {/* 16px text: iOS zooms the page when a smaller select gets focus. */}
      <select
        value={locale}
        onChange={e => setLocale(e.target.value as Locale)}
        className="field-sizing-content min-h-10 outline-none grow cursor-pointer appearance-none bg-transparent pr-7 pl-2 text-right text-base"
      >
        {LOCALE_NAMES.map(([key, name]) => (
          <option key={key} value={key} lang={key} className="bg-night-deep text-paper">
            {name}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2 text-xs">
        ▼
      </span>
    </label>
  );
}
