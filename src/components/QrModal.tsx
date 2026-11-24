import { QRCodeSVG } from "qrcode.react";
import { getJoinUrl } from "../game/room";
import type { Room } from "../game/types";
import { useLocale } from "../locales";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function QrModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const { t } = useLocale();
  const url = getJoinUrl(room);

  return (
    <Modal title={t.qr.title} onClose={onClose}>
      {close => (
        <>
          <QRCodeSVG value={url} marginSize={2} bgColor="#ffffff" className="mx-auto my-4 h-auto w-full max-w-[60dvh]" />
          <p className="mt-2 line-clamp-2 text-sm font-normal break-all select-all">{url}</p>
          <Button tone="primary" className="mt-4 w-full" onClick={close}>
            {t.qr.close}
          </Button>
        </>
      )}
    </Modal>
  );
}
