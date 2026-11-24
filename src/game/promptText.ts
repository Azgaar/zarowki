export interface PromptSegment {
  text: string;
  /** Place on the 1–10 scale. Absent for plain text. */
  value?: number;
}

const GUESSER = "{{guesser}}";
// A marker may contain the guesser placeholder.
const MARKER = /\{\{(10|[1-9]):((?:\{\{guesser\}\}|[^{}])+)\}\}/g;

/**
 * Splits "from {{1:trash}} to {{10:treasure}}" into plain and valued segments.
 * The name is put in after splitting, so a name with braces cannot break the markup.
 */
export function parsePromptText(text: string, guesser: string): PromptSegment[] {
  const withName = (part: string) => part.replaceAll(GUESSER, () => guesser);
  const segments: PromptSegment[] = [];
  let end = 0;
  for (const match of text.matchAll(MARKER)) {
    if (match.index > end) segments.push({ text: withName(text.slice(end, match.index)) });
    segments.push({ text: withName(match[2]!), value: Number(match[1]) });
    end = match.index + match[0].length;
  }
  if (end < text.length) segments.push({ text: withName(text.slice(end)) });
  return segments;
}
