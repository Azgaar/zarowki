import { Button } from "./Button";
import { FitName } from "./FitName";

interface Props {
  names: readonly string[];
  /** 1-based seat. */
  selected: number | null;
  onSelect: (seat: number) => void;
  /** A seat that cannot be picked. */
  disabledSeat?: number;
  tone?: "paper" | "dark";
  className?: string;
  tileClassName?: string;
}

export function NamePicker({ names, selected, onSelect, disabledSeat, tone = "paper", className = "", tileClassName = "" }: Props) {
  return (
    <div className={`grid gap-3 compact:gap-2 ${className}`}>
      {names.map((name, i) => (
        <Button
          key={name}
          tone={i + 1 === selected ? "primary" : tone}
          className={`px-1 ${tileClassName}`}
          disabled={i + 1 === disabledSeat}
          aria-pressed={i + 1 === selected}
          onClick={() => onSelect(i + 1)}
        >
          <FitName name={name} />
        </Button>
      ))}
    </div>
  );
}
