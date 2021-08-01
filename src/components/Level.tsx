import { CodeBlock, ProgramBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { CanvasRenderer } from "../logic/animation";
import { InterpreterSnapshot, interpretProgram } from "../logic/interpret";
import { useStream } from "../types/Stream";

const minimumHighlightTime = 400;

export default ({ levelNumber }: { levelNumber: number }) => {
  const [interpreterSnapshot, setInterpreterSnapshot] =
    useState<null | InterpreterSnapshot>(null);
  const renderer = useRef<CanvasRenderer>(new CanvasRenderer(null));

  const interpreterState = useRef(
    interpretProgram(levelsList[0], {
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
    if (snapshot.done) return;

    const [snapshotPath, snapshotBlock] = snapshot.value;

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

      renderer.current.render();
      forwardEvaluation();
    }
  }, []);

  return (
    <>
      <p>Level: {Number(levelNumber) + 1}</p>
      <div>
        <ProgramBlock
          highlighted={interpreterSnapshot?.[0] ?? null}
          program={levelsList[0]}
        />
        <canvas width="1000" height="1000" ref={canvasRef} />
      </div>
    </>
  );
};
