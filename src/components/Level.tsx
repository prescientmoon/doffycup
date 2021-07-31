import { CodeBlock } from "./CodeBlock";

import { levelsList } from "../logic/levelsList";

export default ({ levelNumber }: { levelNumber: number }) => {
    return (
        <>
            <p>Level: {levelNumber}</p>
            <div>
                <CodeBlock block={levelsList[0]} />
            </div>
        </>
    );
};
