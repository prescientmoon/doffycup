import { ComponentChildren } from "preact";
import { ADT } from "ts-adt";

// ========== High level dsl
export type Vec2 = [number, number];

export interface LevelSection {
  hidden: boolean;
  program: Program;
}

export type Level = {
  cups: number;
  program: Program;
  startingBalls: Partial<Record<BlockColor, number>>;
  question: BlockColor;
};

export type Program = Block[];

export type FlatBlock = ADT<{
  swap: {
    cups: [number, number];
  };
}>;

export type Block =
  | ADT<{
      repeat: {
        times: number;
        program: Program;
      };
      ifContainsBall: {
        target: number;
        ballColor: BlockColor;
        then: Program;
        otherwise: Program;
      };
    }>
  | FlatBlock;

export type CodeBlockPath = number[];

// ========== Program execution stuff
export type ExecutionState = {
  cups: Array<BlockColor | null>;
  path: CodeBlockPath;
};

export const enum PushDirection {
  Down,
  Up,
}

export type ExecutionAnimation = ADT<{
  swap: {};
}>;

export type AnimationStep = {
  amount: Vec2;
  length: number;
};

export type AnimationQueues = {
  startedAt: number;
  step: number;
  cup: number;
  startedOn: number;
  endsOn: number;
  steps: AnimationStep[];
};

export type AnimationState = {
  cups: Array<{
    position: Vec2;
    beforeAnimation: Vec2;
    isLifted: boolean;
    ball: BlockColor | null;
  }>;
  hovered: number | null;
};

// ========== Low level dsl
export type BlockColor = "orange" | "blue" | "cyan" | "green";

export type VisualBlock = {
  text: ComponentChildren;
  color: BlockColor;
  children: Array<VisualBlock>;
};
