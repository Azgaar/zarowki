import type { ButtonHTMLAttributes } from "react";

export function FooterLink(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="min-h-10 px-2 text-base text-paper/70 underline underline-offset-4"
      {...props}
    />
  );
}
