import { CodeBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";

export default ({ levelNumber }: { levelNumber: number }) => {
    return (
        <>
            <p>Level: {Number(levelNumber) + 1}</p>
            <div>
                <CodeBlock highlighted={[0]} block={levelsList[0]} />
            </div>
        </>
    );
};
