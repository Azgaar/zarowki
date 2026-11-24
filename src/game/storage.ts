import { isInteger } from './isInteger';
import { HOST_SEAT } from './types';

/** localStorage that never throws (private mode, blocked storage, stale JSON). */
export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`zarowki:${key}`);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(`zarowki:${key}`);
    else localStorage.setItem(`zarowki:${key}`, JSON.stringify(value));
  } catch {
    // The game still works for this page load.
  }
}

/** Seat of a joined player, who is never the host. */
export function loadSeat(key: string, playerCount: number): number | null {
  const seat = load(key);
  return isInteger(seat, HOST_SEAT + 1, playerCount) ? seat : null;
}
