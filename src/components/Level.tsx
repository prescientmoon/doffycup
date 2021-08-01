import { ProgramBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { CanvasRenderer, cupSize, cupSpacing } from "../logic/animation";
import { InterpreterSnapshot, interpretProgram } from "../logic/interpret";
import { useStream } from "../types/Stream";
import "../styles/level.css";
import { ADT } from "ts-adt";
import { Vec2Like } from "@thi.ng/vectors";
import { BlockColor, ExecutionState } from "src/types/Program";
import { ComponentChildren } from "preact";
import { useAppState } from "../logic/state";

const minimumHighlightTime = 700;

type LevelState = ADT<{
  waitingForAnswer: {
    prompt: ComponentChildren;
    solution: ExecutionState["cups"];
  };
  executing: {};
  waiting: {};
  waitinForLiftDown: {};
  waitingForLiftUp: {};
}>;

export default ({ levelNumber }: { levelNumber: number }) => {
  const [interpreterSnapshot, setInterpreterSnapshot] =
    useState<null | InterpreterSnapshot>(null);
  const renderer = useRef<CanvasRenderer>(new CanvasRenderer(null));

  const currentLevel = levelsList[levelNumber];

  const currentProgram = currentLevel.program;
  const [lastMousePosition, setMousePosition] = useState<Vec2Like | null>(null);
  const [appState, setAppState] = useAppState();

  const levelCompleted = appState.completed > levelNumber;

  const [currentState, setCurrentState] = useState<LevelState>({
    _type: "waiting",
  });

  const cups = Array(currentLevel.cups)
    .fill(1)
    .map((_, index) => {
      for (let color in currentLevel.startingBalls) {
        if (currentLevel.startingBalls[color as BlockColor] === index)
          return color as BlockColor;
      }

      return null;
    });

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const initialExecutionState = {
    path: [],
    cups: [...cups],
  };

  const interpreterState = useRef(
    interpretProgram(currentProgram, initialExecutionState)
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const execute = () => {
    if (!levelCompleted) {
      renderer.current.animationSpeed = 20;
    }

    setCurrentState({
      _type: "executing",
    });
  };

  const forwardEvaluation = useCallback(() => {
    const waitAndContinue = () => {
      setTimeout(forwardEvaluation, minimumHighlightTime / playbackSpeed);
    };

    const snapshot = interpreterState.current.next();
    if (snapshot.done) {
      setCurrentState({
        _type: "waitingForAnswer",
        solution: snapshot.value,
        prompt: (
          <>
            Where is{" "}
            <span
              className={`level__prompt-ball level__prompt-ball--${currentLevel.question}`}
            />{" "}
            ?
          </>
        ),
      });

      return setInterpreterSnapshot(null);
    }

    const [, snapshotBlock] = snapshot.value;

    setInterpreterSnapshot(snapshot.value);

    switch (snapshotBlock._type) {
      case "ifContainsBall":
      case "repeat":
        waitAndContinue();
        break;
      case "swap":
        renderer.current.animateBlock(snapshotBlock);
        break;
    }
  }, [interpreterState, renderer]);

  useStream(
    renderer.current.onAnimationOver,
    () => {
      if (currentState._type === "executing") forwardEvaluation();
      if (currentState._type === "waitingForLiftUp") {
        setCurrentState({
          _type: "waitinForLiftDown",
        });

        renderer.current.unliftAll();
      }
      if (currentState._type === "waitinForLiftDown") {
        execute();

        interpreterState.current = interpretProgram(currentProgram, {
          path: [],
          cups,
        });

        renderer.current.shouldRenderBalls = false;

        forwardEvaluation();
      }
    },
    [interpreterState, renderer, currentState]
  );

  // Kickstart rendering
  useEffect(() => {
    if (
      canvasRef !== null &&
      canvasRef.current !== renderer.current.context?.canvas
    ) {
      const context = canvasRef.current?.getContext("2d")!;

      context.imageSmoothingEnabled = false;

      renderer.current.context = context;

      renderer.current.freshCups(currentLevel.cups, cups);

      renderer.current.resize();
      renderer.current.render();

      renderer.current.shouldRenderBalls = true;
      renderer.current.liftAll();
    }
  }, []);

  useEffect(() => {
    const state = renderer.current.animationState;
    if (
      lastMousePosition === null ||
      currentState._type !== "waitingForAnswer"
    ) {
      state.hovered = null;
      return;
    }

    if (
      lastMousePosition[1] < cupSpacing + cupSize[1] ||
      lastMousePosition[1] > 3 * cupSpacing + 2 * cupSize[1]
    ) {
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
            onClick={() => {
              if (currentState._type === "waitingForAnswer") {
                if (renderer.current.animationState.hovered === null) return;

                if (
                  currentState.solution[
                    renderer.current.animationState.hovered
                  ] === currentLevel.question
                )
                  console.log("won");
              }
            }}
            onMouseLeave={() => {
              setMousePosition(null);
            }}
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
          {currentState._type === "waitingForAnswer" && (
            <div className="level__prompt">
              <div className="level__prompt-text">{currentState.prompt}</div>
            </div>
          )}
          {
            <div className="playAnimationButtonContainer">
              <div
                className="playAnimationButton"
                onClick={() => {
                  if (currentState._type !== "waiting") {
                    renderer.current.forceAnimationFinish();
                    renderer.current.shouldRenderBalls = true;
                    renderer.current.freshCups(currentLevel.cups, cups);
                  }

                  renderer.current.animationSpeed = playbackSpeed;
                  if (currentState._type === "waiting") {
                    setCurrentState({
                      _type: "waitinForLiftDown",
                    });
                    renderer.current.unliftAll();
                  } else {
                    setCurrentState({
                      _type: "waitingForLiftUp",
                    });
                    renderer.current.liftAll();
                  }
                }}
              >
                Play: x{playbackSpeed}
              </div>
              <input
                className="playbackSpeedInput"
                type="range"
                min="1"
                max="5"
                value={playbackSpeed}
                step="0.1"
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setPlaybackSpeed(Number(target.value));
                }}
              />
            </div>
          }
        </div>
      </div>
    </>
  );
};
