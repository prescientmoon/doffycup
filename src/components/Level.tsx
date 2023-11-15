import { h, Fragment, ComponentChildren } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Link, useLocation } from "wouter-preact";
import { ADT } from "ts-adt";

import { ProgramBlock } from "./CodeBlock";
import { levelsList } from "../logic/levelsList";
import { CanvasRenderer, cupSize, cupSpacing } from "../logic/animation";
import { InterpreterSnapshot, interpretProgram } from "../logic/interpret";
import { useStream } from "../types/Stream";
import "../styles/level.css";
import { BlockColor, ExecutionState, Vec2 } from "src/types/Program";
import { useAppState } from "../logic/state";

const minimumHighlightTime = 700;

type LevelState = ADT<{
  waitingForAnswer: {
    prompt: ComponentChildren;
    solution: ExecutionState["cups"];
  };
  success: {
    prompt: ComponentChildren;
  };
  executing: {};
  waiting: {};
  waitinForLiftDown: {};
  waitinForSingleLiftDown: { index: number; solution: ExecutionState["cups"] };
  waitingForLiftUp: {};
  waitinForSingleLiftUp: { index: number; solution: ExecutionState["cups"] };
}>;

export default (props: { levelNumber: string }) => {
  const levelNumber = Number(props.levelNumber) || 0;
  const [globalState] = useAppState();
  const [, setLocation] = useLocation();
  if (
    levelNumber > globalState.completed ||
    levelNumber > levelsList.length - 1
  ) {
    setLocation("/levels");
  }

  const [interpreterSnapshot, setInterpreterSnapshot] =
    useState<null | InterpreterSnapshot>(null);
  const renderer = useRef<CanvasRenderer>(new CanvasRenderer(null));

  const currentLevel = levelsList[levelNumber] || levelsList[0];

  const currentProgram = currentLevel.program || null;
  const [lastMousePosition, setMousePosition] = useState<Vec2 | null>(null);
  const [appState, setAppState] = useAppState();

  const levelCompleted = appState.completed > levelNumber;

  const [currentState, setCurrentState] = useState<LevelState>({
    _type: "waiting",
  });

  const cups = Array(currentLevel.cups)
    .fill(1)
    .map((_, index) => {
      for (let color in currentLevel?.startingBalls) {
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
    interpretProgram(currentProgram, initialExecutionState),
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const execute = () => {
    if (!levelCompleted) {
      renderer.current.animationSpeed = 10;
    }

    setCurrentState({
      _type: "executing",
    });
  };

  const askForUserGuess = (solution: ExecutionState["cups"]) => {
    setCurrentState({
      _type: "waitingForAnswer",
      solution,
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
  };

  const forwardEvaluation = useCallback(() => {
    const waitAndContinue = () => {
      setTimeout(forwardEvaluation, minimumHighlightTime / playbackSpeed);
    };

    const snapshot = interpreterState.current.next();
    if (snapshot.done) {
      askForUserGuess(snapshot.value);

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
      if (currentState._type === "waitinForSingleLiftUp") {
        setCurrentState({
          _type: "waitinForSingleLiftDown",
          index: currentState.index,
          solution: currentState.solution,
        });
        renderer.current.unliftCup(currentState.index);
      }
      if (currentState._type === "waitinForSingleLiftDown") {
        askForUserGuess(currentState.solution);
      }
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
    [interpreterState, renderer, currentState],
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
  });

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
      (lastMousePosition[0] + cupSpacing / 2) / (cupSpacing + cupSize[0]),
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
                ) {
                  setCurrentState({
                    _type: "success",
                    prompt: (
                      <span className="level__success-prompt">
                        Congratulations!
                      </span>
                    ),
                  });

                  renderer.current.shouldRenderBalls = true;
                  renderer.current.liftCup(
                    renderer.current.animationState.hovered,
                  );

                  if (!levelCompleted) {
                    setAppState({
                      _type: "completeLevel",
                      level: Number(levelNumber) + 1,
                    });
                  }
                } else {
                  renderer.current.liftCup(
                    renderer.current.animationState.hovered,
                  );

                  setCurrentState({
                    _type: "waitinForSingleLiftUp",
                    index: renderer.current.animationState.hovered,
                    solution: currentState.solution,
                  });
                }
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
          {(currentState._type === "success" ||
            currentState._type === "waitingForAnswer") && (
            <div className="level__prompt">
              <div className="level__prompt-text">{currentState.prompt}</div>
            </div>
          )}
          {
            <div className="nextLevelPlayContainer">
              {levelNumber != globalState.completed ? (
                <Link href={`/levels/${levelNumber + 1}`}>
                  <div className="nextLevelButton">Next {">>"}</div>
                </Link>
              ) : (
                ""
              )}
              <div className="playAnimationButtonContainer">
                <div
                  className={`playAnimationButton ${
                    levelNumber == globalState.completed
                      ? "playAnimationButtonSpecial"
                      : ""
                  }`}
                  onClick={() => {
                    renderer.current.animationSpeed = playbackSpeed;
                    if (currentState._type !== "waiting") {
                      renderer.current.forceAnimationFinish();
                      renderer.current.shouldRenderBalls = true;
                      renderer.current.freshCups(currentLevel.cups, cups);
                    }

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
                  { 
                    levelCompleted
                      ? `Play (x${playbackSpeed})`
                      : "Start"
                  }
                </div>
                <input
                  className={`playbackSpeedInput ${
                    levelNumber == globalState.completed
                      ? "playbackSpeedInputDisabled"
                      : ""
                  }`}
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
            </div>
          }
        </div>
      </div>
    </>
  );
};
