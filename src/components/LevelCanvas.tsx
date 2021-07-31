import { useEffect, useRef } from "preact/hooks";
import { CanvasRenderer } from "../logic/animation";

export const LevelCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref !== null) {
      const context = ref.current?.getContext("2d")!;
      const renderer = new CanvasRenderer(context);

      renderer.freshCups(7);

      return () => renderer.dispose();
    }
  }, []);

  return <canvas width="1000" height="1000" ref={ref} />;
};
