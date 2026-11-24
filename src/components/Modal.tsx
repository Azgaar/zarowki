import { type ReactNode, useEffect, useRef } from "react";

interface Props {
  title: string;
  onClose: () => void;
  /** Receives a function that closes the dialog. */
  children: (close: () => void) => ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className="chunky m-auto w-[min(92vw,30rem)] bg-paper p-5 text-center text-ink backdrop:bg-ink/80"
    >
      <h2 className="text-2xl font-black text-balance">{title}</h2>
      {children(() => ref.current?.close())}
    </dialog>
  );
}
