const WIDE = /[жшщюмфыъwm@%]/giu;

/** Width in average characters of the bold font. */
const widthOf = (text: string): number => text.length + 0.5 * (text.match(WIDE)?.length ?? 0);

/** One line of text that shrinks to the width of its parent when the name is long. */
export function FitName({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`@container block w-full ${className}`}>
      <span
        className="block overflow-hidden text-center text-ellipsis whitespace-nowrap"
        style={{ fontSize: `min(1em, ${150 / widthOf(name)}cqw)` }}
      >
        {name}
      </span>
    </span>
  );
}
