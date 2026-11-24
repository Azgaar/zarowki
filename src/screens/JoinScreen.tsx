import { useState } from "react";
import { Button } from "../components/Button";
import { FitName } from "../components/FitName";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { NamePicker } from "../components/NamePicker";
import { HOST_SEAT } from "../game/types";
import { useLocale } from "../locales";

/** The host plays on the board device. The choice is final, so a stray tap must not make it: select, then confirm. */
export function JoinScreen({ names, onJoin }: { names: readonly string[]; onJoin: (seat: number) => void }) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-5 compact:gap-3 compact:py-3">
      <Logo />
      <h2 className="text-center text-2xl font-extrabold">{t.join.title}</h2>
      <NamePicker
        names={names}
        selected={selected}
        onSelect={setSelected}
        disabledSeat={HOST_SEAT}
        className={names.length > 8 ? "grid-cols-3" : "grid-cols-2"}
        tileClassName="min-h-16 text-xl compact:min-h-14"
      />
      <Button
        tone="primary"
        className="sticky bottom-3 mt-auto min-h-16 w-full text-2xl disabled:invisible"
        disabled={selected === null}
        onClick={() => selected !== null && onJoin(selected)}
      >
        {selected !== null && <FitName name={t.join.confirm(names[selected - 1]!)} />}
      </Button>
      <Footer className="-my-2" />
    </main>
  );
}
