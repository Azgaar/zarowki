import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from "./types";

// Half emoji (an input's length limit can leave them), control characters and zero-width spaces.
const INVISIBLE = /[\p{Cs}\u0000-\u0008\u000e-\u001f\u007f-\u009f\u200b\u2060]/gu;

/** Drops invisible characters and extra spaces. */
export const cleanName = (name: string): string =>
  name.replace(INVISIBLE, "").normalize("NFC").replace(/\s+/g, " ").trim();

const key = (name: string): string => cleanName(name).toLowerCase();

/** Indexes of names that repeat an earlier one: two players must never look the same. */
export function getDuplicates(names: readonly string[]): number[] {
  const keys = names.map(key);
  return keys.flatMap((k, i) => (k !== "" && keys.indexOf(k) < i ? [i] : []));
}

export function areNamesValid(names: readonly string[]): boolean {
  return (
    names.length >= MIN_PLAYERS &&
    names.length <= MAX_PLAYERS &&
    names.every(n => n !== "" && n === cleanName(n) && n.length <= MAX_NAME_LENGTH) &&
    getDuplicates(names).length === 0
  );
}

/** URL-safe base64 of UTF-8: half the size of percent-encoding for Cyrillic, so the QR code stays easy to scan. */
export function encodeNames(names: readonly string[]): string {
  const bytes = new TextEncoder().encode(names.join("\n"));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

/** Null when the text is damaged or holds an invalid set of names. */
export function decodeNames(text: string): string[] | null {
  try {
    const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const names = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\n");
    return areNamesValid(names) ? names : null;
  } catch {
    return null;
  }
}
