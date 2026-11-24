import { useLocale } from '../locales';
import { Bulb } from './Bulb';

export function Logo() {
  const { t } = useLocale();
  return (
    <h1 className="flex -translate-x-1 items-center justify-center gap-2 text-5xl font-black tracking-tight text-amber">
      <Bulb lit className="h-14" />
      {t.title}
    </h1>
  );
}
