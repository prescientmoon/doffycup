export const clamp = (nr: number, min: number, max: number) =>
  Math.min(Math.max(nr, min), max);
