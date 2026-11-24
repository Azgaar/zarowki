import { Button } from '../components/Button';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLocale } from '../locales';
import { updateNow, useAppUpdates } from '../update';

/** The host has another version of the game. Updates this device; if that does not help, the host's version is the old one. */
export function VersionScreen() {
  const { t } = useLocale();
  useAppUpdates();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-5 text-center text-xl">
      <p>{t.error.version}</p>
      <Button tone="primary" onClick={() => void updateNow()}>
        {t.error.update}
      </Button>
      <p className="text-base font-medium text-balance">{t.error.hostVersion}</p>
      <LanguageSelect className="self-center text-paper/70" />
    </main>
  );
}
