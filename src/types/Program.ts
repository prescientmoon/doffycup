import { ComponentChildren } from "preact";
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

export type CodeBlockPath = number[];

// ========== Low level dsl
export type BlockColor = "yellow" | "red" | "blue";

export type VisualBlock = {
  text: ComponentChildren;
  color: BlockColor;
  children: Array<VisualBlock>;
};
