import { ProgramBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { CanvasRenderer, cupSize, cupSpacing } from "../logic/animation";
import { InterpreterSnapshot, interpretProgram } from "../logic/interpret";
import { useStream } from "../types/Stream";
import "../styles/level.css";
import { ADT } from "ts-adt";
import { Vec2Like } from "@thi.ng/vectors";

const minimumHighlightTime = 400;

type LevelState = ADT<{
  executing: {};
  waiting: { prompt: string };
}>;

export default ({ levelNumber }: { levelNumber: number }) => {
  const [interpreterSnapshot, setInterpreterSnapshot] =
    useState<null | InterpreterSnapshot>(null);
  const renderer = useRef<CanvasRenderer>(new CanvasRenderer(null));

  const currentLevel = levelsList[levelNumber];

  const [currentSection, setCurrentSection] = useState(0);
  const currentProgram = currentLevel.sections[currentSection].program;
  const [lastMousePosition, setMousePosition] = useState<Vec2Like | null>(null);

  const [currentState, setCurrentState] = useState<LevelState>({
    _type: "waiting",
    prompt: "Waiting for execution to start",
  });

  const interpreterState = useRef(
    interpretProgram(currentProgram, {
      path: [],
      cups: Array(currentLevel.cups)
        .fill(1)
        .map((_, index) => index === currentLevel.startingBall),
    })
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const forwardEvaluation = useCallback(() => {
    const waitAndContinue = () => {
      setTimeout(forwardEvaluation, minimumHighlightTime);
    };

    const snapshot = interpreterState.current.next();
    if (snapshot.done) {
      setCurrentState({ _type: "waiting", prompt: "Where is the ball?" });
      return setInterpreterSnapshot(null);
    }

    const [, snapshotBlock] = snapshot.value;

    setInterpreterSnapshot(snapshot.value);

    switch (snapshotBlock._type) {
      case "repeat":
        waitAndContinue();
        break;
      case "swap":
        renderer.current.animateBlock(snapshotBlock);
        break;
    }
  }, [interpreterState, renderer]);

  useStream(renderer.current.onAnimationOver, forwardEvaluation, [
    interpreterState,
    renderer,
  ]);

  // Kickstart rendering
  useEffect(() => {
    if (
      canvasRef !== null &&
      canvasRef.current !== renderer.current.context?.canvas
    ) {
      const context = canvasRef.current?.getContext("2d")!;

      context.imageSmoothingEnabled = false;

      renderer.current.context = context;

      renderer.current.freshCups(currentLevel.cups);

      renderer.current.resize();
      renderer.current.render();

      forwardEvaluation();
      setCurrentState({ _type: "executing" });
    }
  }, []);

  useEffect(() => {
    const state = renderer.current.animationState;
    if (lastMousePosition === null || currentState._type !== "waiting") return;

    if (
      lastMousePosition[1] < cupSpacing + cupSize[1] ||
      lastMousePosition[1] > 3 * cupSpacing + 2 * cupSize[1]
    ) {
      console.log(lastMousePosition);
      renderer.current.context?.fillRect(
        lastMousePosition[0],
        lastMousePosition[1],
        100,
        100
      );

      state.hovered = null;
      return;
    }

    state.hovered = Math.floor(
      (lastMousePosition[0] + cupSpacing / 2) / (cupSpacing + cupSize[0])
    );
  }, [lastMousePosition]);

  return (
    <>
      <div class="level">
        <div className="level__left">
          <p className="level__title">Level: {Number(levelNumber) + 1}</p>
          <div className="level__left-script-container">
            <ProgramBlock
              highlighted={interpreterSnapshot?.[0] ?? null}
              program={currentProgram}
            />
          </div>
        </div>
        <div className="level__right">
          <canvas
            width="1000"
            height="1000"
            onMouseMove={(e) => {
              const canvas = e.target as HTMLCanvasElement;
              const clientRect = canvas.getBoundingClientRect();
              setMousePosition([
                (canvas.width * (e.clientX - clientRect.left)) /
                  clientRect.width,
                (canvas.height * (e.clientY - clientRect.top)) /
                  clientRect.height,
              ]);
            }}
            ref={canvasRef}
          />
          {currentState._type === "waiting" && (
            <div className="level__prompt">
              <div className="level__prompt-text">{currentState.prompt}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
