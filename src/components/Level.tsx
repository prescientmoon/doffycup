import { CodeBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";
import { LevelCanvas } from "./LevelCanvas";

export default ({ levelNumber }: { levelNumber: number }) => {
  return (
    <>
      <p>Level: {Number(levelNumber) + 1}</p>
      <div>
        <CodeBlock highlighted={[0]} block={levelsList[0]} />

        <LevelCanvas />
      </div>
    </>
  );
};
