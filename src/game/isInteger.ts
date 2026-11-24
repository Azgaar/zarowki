export function isInteger(value: unknown, min: number, max = Infinity): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}
