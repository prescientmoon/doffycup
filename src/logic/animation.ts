import {
  AnimationQueues as AnimationQueue,
  AnimationState,
  BlockColor,
  FlatBlock,
  Vec2,
} from "src/types/Program";
import * as Stream from "../types/Stream";
import { add2 } from "./helpers";
import cupTextureUrl from "../assets/cup.png";

// ========== Constants

const cupTexture = new Image(343, 400);
cupTexture.src = cupTextureUrl;

export const cupSize = [cupTexture.width, cupTexture.height] as const;
export const cupSpacing = 20;
export const liftAmount = 200;
export const ballRadius = 100;
export const blockColors: Record<BlockColor, string> = {
  blue: " #2e82f7",
  orange: "#dfa94d",
  green: "#5fcf9c",
  cyan: "#5ac9ca",
};

// ========== Implementation
const blockToAnimation = (
  block: FlatBlock,
  placeToId: (id: number) => number | undefined,
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
            amount: [0, -cupSize[1] / 2 - cupSpacing],
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
            amount: [0, cupSize[1] / 2 + cupSpacing],
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
    cups: [],
    hovered: null,
  };

  public animationSpeed = 1;
  private cupOrigins: Partial<Record<number, number>> = {};
  private animationsInProgress: Array<AnimationQueue> = [];

  public onAnimationOver: Stream.Stream<void>;
  private emitOnAnimationOver: () => void;

  public shouldRenderBalls = false;

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

  public freshCups(count: number, balls: Array<null | BlockColor>) {
    this.animationState.cups = Array(count)
      .fill(1)
      .map((_, index) => {
        const position = cupDefaultPosition(index) as Vec2;

        return {
          position,
          beforeAnimation: position,
          isLifted: false,
          ball: balls[index],
        };
      });

    this.cupOrigins = Array(count)
      .fill(1)
      .map((_, index) => index);
  }

  public forceAnimationFinish() {
    for (const animation of this.animationsInProgress) {
      for (
        let stepIndex = animation.step;
        stepIndex < animation.steps.length;
        stepIndex++
      ) {
        const cup = this.animationState.cups[animation.cup];
        cup.position = add2(
          cup.position,
          animation.steps[stepIndex].amount,
        ) as Vec2;
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
        throw new Error(
          `Invalid animation: cup with id ${queue.cup} is supposed to exist at ${queue.startedOn}`,
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
            (currentStep.length / this.animationSpeed)
        );
      }) as [number, number];

      if (
        animation.startedAt + currentStep.length / this.animationSpeed <=
        now
      ) {
        cup.position = add2(currentStep.amount, cup.beforeAnimation) as Vec2;
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

    const cups: { position: Vec2; index: number }[] = [];

    for (let index = 0; index < this.animationState.cups.length; index++) {
      const cup = this.animationState.cups[index];

      if (cup === null) continue;

      let y = cup.position[1];

      if (
        this.animationState.hovered! ===
        Object.values(this.cupOrigins).indexOf(index)
      )
        y -= 20;

      if (cup.isLifted) y -= 40;

      cups.push({ position: [cup.position[0], y], index });
    }

    cups.sort((a, b) => a.position[1] - b.position[1]);

    for (const { position, index } of cups) {
      this.context.drawImage(
        cupTexture,
        position[0],
        position[1],
        cupSize[0],
        cupSize[1],
      );

      const label = Object.values(this.cupOrigins).indexOf(index) + 1;

      if (label === 0 || this.animationsInProgress.length) continue;

      this.context.fillStyle = "black";
      this.context.font = "100px Roboto mono";
      this.context.textAlign = "center";
      this.context.fillText(
        String(label),
        position[0] + cupSize[0] / 2,
        position[1] - 20,
      );
    }
  }

  public liftCup(index: number) {
    this.animationsInProgress.push({
      cup: this.cupOrigins[index]!,
      startedOn: index,
      endsOn: index,
      startedAt: performance.now(),
      step: 0,
      steps: [
        {
          amount: [0, -liftAmount],
          length: 400,
        },
      ],
    });
  }

  public unliftCup(index: number) {
    this.liftCup(index);

    for (const step of this.animationsInProgress[
      this.animationsInProgress.length - 1
    ].steps) {
      step.amount[1] *= -1;
    }
  }

  public liftAll() {
    //this.forceAnimationFinish();
    for (let i = 0; i < this.animationState.cups.length; i++) this.liftCup(i);
  }

  public unliftAll() {
    //this.forceAnimationFinish();
    for (let i = 0; i < this.animationState.cups.length; i++) this.unliftCup(i);
  }

  private renderBalls() {
    if (!this.context || !this.shouldRenderBalls) return;

    const ballY = 2 * cupSize[1] + cupSpacing - ballRadius;
    this.context.lineWidth = 16;

    for (let i = 0; i < this.animationState.cups.length; i++) {
      const cup = this.animationState.cups[i];

      if (!cup.ball) continue;

      this.context.fillStyle = blockColors[cup.ball];

      this.context.beginPath();
      this.context.arc(
        cup.position[0] + cupSize[0] / 2,
        ballY,
        ballRadius,
        0,
        2 * Math.PI,
      );
      this.context.fill();
      this.context.stroke();
    }
  }

  public render() {
    this.update();

    if (this.context) {
      this.context.clearRect(0, 0, 10000, 10000);
      0;
      this.renderBalls();
      this.renderAnimationState();
    }

    this.handlerId = requestAnimationFrame(() => this.render());
  }

  public dispose() {
    if (this.handlerId !== null) cancelAnimationFrame(this.handlerId);
  }
}
