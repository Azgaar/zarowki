import { useState } from "react";
import { useLocale } from "../locales";
import { Button } from "./Button";
import { Footer } from "./Footer";
import { FooterLink } from "./FooterLink";
import { Modal } from "./Modal";

interface Props {
  /** What happens to this device's game, shown before confirming. */
  hint: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
  className?: string;
}

/** In-game footer: new game (with confirmation), rules and options. */
export function GameFooter({ hint, onPlayAgain, onNewGame, className = "" }: Props) {
  const { t } = useLocale();
  const [confirming, setConfirming] = useState(false);

  return (
    <Footer className={className}>
      <FooterLink onClick={() => setConfirming(true)}>{t.newGame.action}</FooterLink>
      {confirming && (
        <Modal title={t.newGame.confirm} onClose={() => setConfirming(false)}>
          {close => (
            <>
              <p className="mt-4 mb-2 text-base font-medium text-balance">{t.newGame.againHint}</p>
              <Button
                tone="primary"
                className="w-full"
                onClick={() => {
                  close();
                  onPlayAgain();
                }}
              >
                {t.newGame.again}
              </Button>
              <p className="mt-5 mb-2 text-base font-medium text-balance">{hint}</p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={close}>{t.newGame.cancel}</Button>
                <Button tone="dark" onClick={onNewGame}>
                  {t.newGame.setup}
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </Footer>
  );
}
