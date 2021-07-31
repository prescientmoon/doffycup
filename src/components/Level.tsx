import { CodeBlock } from "./CodeBlock";
export default ({ levelNumber }: { levelNumber: number }) => {
    return (
        <>
            <p>Level: {levelNumber}</p>
            <div>
                <CodeBlock
                    block={{
                        color: "red",
                        name: "My first block",
                        children: [],
                    }}
                />
            </div>
        </>
    );
};
