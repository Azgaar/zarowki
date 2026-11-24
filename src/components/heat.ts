// Both scales run from green (1) to red (10).
const BRIGHT = ['#3DCB6C', '#6BD25A', '#98D64A', '#C3D63C', '#E6D232', '#FFC22E', '#FFA530', '#FF8535', '#FF653B', '#FF4545'] as const;
const DARK = ['#0F7A38', '#33781A', '#527510', '#69700A', '#7B6706', '#8E5C05', '#A05005', '#B04208', '#BE2F10', '#C81E1E'] as const;

/** Bars, and text on dark surfaces. */
export const HEAT_STEPS: readonly string[] = BRIGHT;
export const heatColor = (value: number): string => BRIGHT[value - 1] ?? BRIGHT[0];

/** Text on paper: at least 4.5:1 contrast. */
export const heatTextColor = (value: number): string => DARK[value - 1] ?? DARK[0];
