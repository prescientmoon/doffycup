import { add2, Vec2Like } from "@thi.ng/vectors";
import {
  AnimationQueues as AnimationQueue,
  AnimationState,
  FlatBlock,
} from "src/types/Program";
import * as Stream from "../types/Stream";
import cupTextureUrl from "../assets/cup.png";

// ========== Constants

const cupTexture = new Image(343, 400);
cupTexture.src = cupTextureUrl;

export const cupSize = [cupTexture.width / 3, cupTexture.height / 3] as const;
export const cupSpacing = 20;

// ========== Implementation
const blockToAnimation = (
  block: FlatBlock,
  placeToId: (id: number) => number | undefined
): Array<AnimationQueue> => {
  switch (block._type) {
    case "swap":
      const a = placeToId(block.cups[0]);
      const b = placeToId(block.cups[1]);

      if (a === undefined || b === undefined) return [];

      const minAdinmationLength = Math.abs(block.cups[0] - block.cups[1]) * 200;

      const first: AnimationQueue = {
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
        startedOn: block.cups[0],
        endsOn: block.cups[1],
      };

      const second: AnimationQueue = {
        cup: b,
        startedAt: performance.now(),
        startedOn: block.cups[1],
        endsOn: block.cups[0],
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

export class CanvasRenderer {
  private handlerId: null | number = null;
  public animationState: AnimationState = {
    cups: [
      {
        position: [100, 100],
        beforeAnimation: [100, 100],
      },
    ],
    hovered: null,
  };

  private cupOrigins: Record<number, number> = { 0: 0 };
  private animationsInProgress: Array<AnimationQueue> = [];

  public onAnimationOver: Stream.Stream<void>;
  private emitOnAnimationOver: () => void;

  public constructor(public context: CanvasRenderingContext2D | null) {
    const animationOver = Stream.create<void>();

    this.onAnimationOver = animationOver[0];
    this.emitOnAnimationOver = animationOver[1];
  }

  public resize() {
    if (!this.context) return;

    this.context.canvas.width =
      this.animationState.cups.length * cupSize[0] +
      (this.animationState.cups.length + 1) * cupSpacing;
    this.context.canvas.height = 4 * cupSpacing + 3 * cupSize[1];
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
  }

  private forceAnimationFinish() {
    for (const animation of this.animationsInProgress) {
      for (
        let stepIndex = animation.step;
        stepIndex < animation.steps.length;
        stepIndex++
      ) {
        const cup = this.animationState.cups[animation.cup];
        cup.position = add2(
          null,
          cup.position,
          animation.steps[stepIndex].amount
        ) as Vec2Like;
      }
    }

    this.animationsInProgress = [];
  }

  public animateBlock(block: FlatBlock) {
    this.animate(blockToAnimation(block, (id) => this.cupOrigins[id]));
  }

  public animate(queues: Array<AnimationQueue>) {
    this.forceAnimationFinish();

    this.animationsInProgress = queues;

    for (const queue of queues) {
      if (this.cupOrigins[queue.startedOn] === queue.cup) {
        delete this.cupOrigins[queue.startedOn];
      } else {
        console.log(this.cupOrigins);

        throw new Error(
          `Invalid animation: cup with id ${queue.cup} is supposed to exist at ${queue.startedOn}`
        );
      }
    }
  }

  private update() {
    const now = performance.now();
    const workToDo = !!this.animationsInProgress.length;

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
        } else {
          animation.step++;
          animation.startedAt = now;
        }
      }
    }

    if (workToDo && this.animationsInProgress.length === 0) {
      this.emitOnAnimationOver();
    }
  }

  private renderAnimationState() {
    if (!this.context) return;

    for (let index = 0; index < this.animationState.cups.length; index++) {
      const cup = this.animationState.cups[index];

      if (cup === null) continue;

      this.context.drawImage(
        cupTexture,
        cup.position[0],
        cup.position[1] -
          (this.animationState.hovered! ===
          Object.values(this.cupOrigins).indexOf(index)
            ? 20
            : 0),
        cupSize[0],
        cupSize[1]
      );
    }
  }

  public render() {
    this.update();

    if (this.context) {
      this.context.clearRect(0, 0, 10000, 10000);
      0;
      this.renderAnimationState();
    }

    this.handlerId = requestAnimationFrame(() => this.render());
  }

  public dispose() {
    if (this.handlerId !== null) cancelAnimationFrame(this.handlerId);
  }
}
