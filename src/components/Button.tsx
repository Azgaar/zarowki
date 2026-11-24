import type { ButtonHTMLAttributes } from "react";

const TONES = {
  primary: "bg-amber text-ink",
  paper: "bg-paper text-ink",
  dark: "bg-night-deep text-paper"
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof TONES };

export function Button({ tone = "paper", className = "", ...props }: Props) {
  return (
    <button type="button" className={`chunky pressable px-2 font-extrabold ${TONES[tone]} ${className}`} {...props} />
  );
}
