import { Vec2 } from "src/types/Program";

export const clamp = (nr: number, min: number, max: number) =>
  Math.min(Math.max(nr, min), max);

export const add2 = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
