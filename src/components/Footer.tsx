import type { ReactNode } from "react";
import { OptionsButton } from "./OptionsButton";
import { RulesButton } from "./RulesButton";

/** Quiet last line of a screen: its own links, then rules and options. */
export function Footer({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <footer className={`-mx-2 flex flex-wrap items-center justify-between ${className}`}>
      {children}
      <RulesButton />
      <OptionsButton />
    </footer>
  );
}
