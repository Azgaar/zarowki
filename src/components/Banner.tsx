import type { ReactNode } from "react";

/** Takes the place of the role bar, so it has the same height. */
export function Banner({ children }: { children: ReactNode }) {
  return (
    <p className="chunky grid min-h-14 place-items-center bg-ember px-3 text-center text-lg font-extrabold text-ink lg:text-2xl">
      {children}
    </p>
  );
}
