import { ProgramBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { CanvasRenderer } from "../logic/animation";
import { InterpreterSnapshot, interpretProgram } from "../logic/interpret";
import { useStream } from "../types/Stream";
import "../styles/level.css";

const minimumHighlightTime = 400;

export default ({ levelNumber }: { levelNumber: number }) => {
  const [interpreterSnapshot, setInterpreterSnapshot] =
    useState<null | InterpreterSnapshot>(null);
  const renderer = useRef<CanvasRenderer>(new CanvasRenderer(null));

  const currentLevel = levelsList[0];

  const [currentSection, setCurrentSection] = useState(0);
  const currentProgram = currentLevel.sections[currentSection].program;

  const interpreterState = useRef(
    interpretProgram(currentProgram, {
      path: [],
      cups: [true, false, false, false, false, false, false],
    })
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const forwardEvaluation = useCallback(() => {
    const waitAndContinue = () => {
      setTimeout(forwardEvaluation, minimumHighlightTime);
    };

    const snapshot = interpreterState.current.next();
    if (snapshot.done) return setInterpreterSnapshot(null);

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

      renderer.current.context = context;

      renderer.current.freshCups(7);

      renderer.current.resize();
      renderer.current.render();
      forwardEvaluation();
    }
  }, []);

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
          <canvas width="1000" height="1000" ref={canvasRef} />
        </div>
      </div>
    </>
  );
};
