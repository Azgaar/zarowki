import { parsePromptText } from '../game/promptText';
import { heatTextColor } from './heat';

/** Prompt with its key words in the color of their place on the 1–10 scale. */
export function PromptText({ text, guesser }: { text: string; guesser: string }) {
  return parsePromptText(text, guesser).map((segment, i) =>
    segment.value === undefined ? (
      segment.text
    ) : (
      <span key={i} className="font-extrabold" style={{ color: heatTextColor(segment.value) }}>
        {segment.text}
      </span>
    ),
  );
}
