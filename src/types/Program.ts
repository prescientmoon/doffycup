import { ADT } from "ts-adt";

// ========== High level dsl
export type Program = Block[];

export type Block = ADT<{
  swap: {
    cups: [number, number];
  };
  repeat: {
    times: number;
    program: Program;
  };
}>;

// ========== Low level dsl
export type VisualBlock = {
  name: string;
  color: string;
  children: Array<VisualBlock>;
};
