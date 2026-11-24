import { Button } from '../components/Button';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLocale } from '../locales';

export function BadLinkScreen() {
  const { t } = useLocale();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-5 text-center text-xl">
      <p>{t.error.badLink}</p>
      <Button tone="primary" onClick={() => window.location.assign(import.meta.env.BASE_URL)}>
        {t.error.home}
      </Button>
      <LanguageSelect className="self-center text-paper/70" />
    </main>
  );
}
