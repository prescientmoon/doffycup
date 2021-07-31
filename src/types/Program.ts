import { ADT } from "ts-adt";

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
