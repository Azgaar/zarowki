import { useState } from "react";
import { isSoundOn, play, setSoundOn } from "../audio/play";
import { useLocale } from "../locales";
import { Button } from "./Button";
import { FooterLink } from "./FooterLink";
import { LanguageSelect } from "./LanguageSelect";
import { Modal } from "./Modal";

/** Settings of this device. They are not in the room link. */
export function OptionsButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <>
      <FooterLink onClick={() => setOpen(true)}>{t.options.action}</FooterLink>
      {open && (
        <Modal title={t.options.action} onClose={() => setOpen(false)}>
          {close => (
            <>
              <div className="my-4 grid gap-3 text-lg font-extrabold">
                <SoundSwitch />
                <LanguageSelect className="chunky min-h-[52px] justify-between pr-1 pl-4" labelClassName="" />
              </div>
              <Button tone="primary" className="w-full" onClick={close}>
                {t.options.close}
              </Button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function SoundSwitch() {
  const { t } = useLocale();
  const [on, setOn] = useState(isSoundOn);

  const toggle = () => {
    setSoundOn(!on);
    setOn(!on);
    // A sample, so that the volume can be set before the game.
    void play({ type: "reveal", value: 5, flawless: false });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t.options.sound}
      className="chunky pressable flex items-center justify-between px-4"
      onClick={toggle}
    >
      {t.options.sound}
      <span className={`rounded-lg border-2 border-ink px-3 py-0.5 text-base ${on ? "bg-amber" : ""}`}>
        {on ? t.options.on : t.options.off}
      </span>
    </button>
  );
}
