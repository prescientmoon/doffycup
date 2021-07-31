import { CodeBlock } from "./CodeBlock";

export default ({ levelNumber }: { levelNumber: number }) => {
  return (
    <>
      <p>Level: {levelNumber}</p>
      <div>
        <CodeBlock
          block={{
            _type: "repeat",
            times: 4,
            program: [
              {
                _type: "swap",
                cups: [0, 3],
              },
              {
                _type: "swap",
                cups: [2, 4],
              },
            ],
          }}
        />
      </div>
    </>
  );
};
