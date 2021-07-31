import { add2, Vec2Like } from "@thi.ng/vectors";
import {
  AnimationQueues,
  AnimationState,
  AnimationStep,
  FlatBlock,
} from "src/types/Program";
import { clamp } from "./helpers";

// ========== Constants
const cupSize = [70, 100] as const;
const cupSpacing = 20;

// ========== Implementation
const blockToAnimation = (
  block: FlatBlock,
  placeToId: (id: number) => number | undefined
): Array<AnimationQueues> => {
  switch (block._type) {
    case "swap":
      const a = placeToId(block.cups[0]);
      const b = placeToId(block.cups[1]);

      if (a === undefined || b === undefined) return [];

      const minAdinmationLength = Math.abs(block.cups[0] - block.cups[1]) * 200;

      const first: AnimationQueues = {
        cup: a,
        startedAt: performance.now(),
        step: 0,
        steps: [
          {
            length: 400,
            amount: [0, -cupSize[1] - cupSpacing],
          },
          {
            length: minAdinmationLength,
            amount: [
              cupDefaultPosition(block.cups[1] - block.cups[0])[0] - cupSpacing,
              0,
            ],
          },
          {
            length: 400,
            amount: [0, cupSize[1] + cupSpacing],
          },
        ],
        startedOn: a,
        endsOn: b,
      };

      const second: AnimationQueues = {
        cup: b,
        startedAt: performance.now(),
        startedOn: b,
        endsOn: a,
        step: 0,
        steps: first.steps.map((_, index, steps) => {
          const analogue = steps[steps.length - index - 1];
          return {
            amount: [-analogue.amount[0], analogue.amount[1]],
            length: analogue.length,
          };
        }),
      };

      return [first, second];
  }
};

const cupDefaultPosition = (nth: number) => {
  const x = nth * cupSize[0] + (nth + 1) * cupSpacing;
  const y = cupSpacing * 2 + cupSize[1];

  return [x, y];
};

export const renderAnimationState = (
  ctx: CanvasRenderingContext2D,
  state: AnimationState
) => {
  for (const cup of state.cups) {
    ctx.fillRect(cup.position[0], cup.position[1], cupSize[0], cupSize[1]);
  }
};

export class CanvasRenderer {
  private handlerId: null | number = null;
  private animationState: AnimationState = {
    cups: [
      {
        position: [100, 100],
        beforeAnimation: [100, 100],
      },
    ],
  };
  private cupOrigins: Record<number, number> = { 0: 0 };
  private animationsInProgress: Array<AnimationQueues> = [];

  public constructor(private context: CanvasRenderingContext2D) {
    this.render();
  }

  public freshCups(count: number) {
    this.animationState.cups = Array(count)
      .fill(1)
      .map((_, index) => {
        const position = cupDefaultPosition(index) as Vec2Like;

        return {
          position,
          beforeAnimation: position,
        };
      });

    this.cupOrigins = Array(count)
      .fill(1)
      .map((_, index) => index);

    this.animationsInProgress = blockToAnimation(
      {
        _type: "swap",
        cups: [0, 4],
      },
      (id) => this.cupOrigins[id]
    );
  }

  private update() {
    const now = performance.now();

    for (let index = 0; index < this.animationsInProgress.length; index++) {
      const animation = this.animationsInProgress[index];

      const cup = this.animationState.cups[animation.cup];
      const currentStep = animation.steps[animation.step];

      // TODO: migrate to thi.ng/vectors
      cup.position = cup.position.map((_, index) => {
        return (
          cup.beforeAnimation[index] +
          ((now - animation.startedAt) * currentStep.amount[index]) /
            currentStep.length
        );
      }) as [number, number];

      if (animation.startedAt + currentStep.length <= now) {
        cup.position = add2(
          [],
          currentStep.amount,
          cup.beforeAnimation
        ) as Vec2Like;
        cup.beforeAnimation = cup.position;
        if (animation.step + 1 >= animation.steps.length) {
          this.animationsInProgress.splice(index, 1);
          if (this.cupOrigins[animation.startedOn] === animation.cup) {
            delete this.cupOrigins[animation.startedOn];
          }

          this.cupOrigins[animation.endsOn] = animation.cup;
          this.cupOrigins[animation.cup] = animation.endsOn;
        } else {
          animation.step++;
          animation.startedAt = now;
        }
      }
    }
  }

  private clear() {
    this.context.clearRect(0, 0, 1000, 1000);
  }

  private render() {
    this.update();
    this.clear();

    renderAnimationState(this.context, this.animationState);

    this.handlerId = requestAnimationFrame(() => this.render());
  }

  public dispose() {
    if (this.handlerId !== null) cancelAnimationFrame(this.handlerId);
  }
}
