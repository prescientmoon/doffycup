import { ComponentChildren } from "preact";
import type {
  Block,
  BlockColor,
  CodeBlockPath,
  Program,
} from "../types/Program";
import "../styles/codeBlock.css";

interface CodeBlockProps {
  block: Block;
  highlighted: CodeBlockPath | null;
}

interface ElseContinuationProps {
  block: Block & { _type: "ifContainsBall" };
  highlighted: CodeBlockPath | null;
}

interface ProgramProps {
  program: Program;
  highlighted: CodeBlockPath | null;
}

const blockColor = (block: Block): BlockColor => {
  switch (block._type) {
    case "repeat":
      return "orange";
    case "swap":
      return "blue";
    case "ifContainsBall":
      return "green";
  }
};

const blockChildren = (block: Block): Program => {
  switch (block._type) {
    case "repeat":
      return block.program;
    case "ifContainsBall":
      return block.then;
    case "swap":
      return [];
  }
};

const CodeBlockHighlight = (props: { children: ComponentChildren }) => {
  return <span className="code-block__highlight">{props.children}</span>;
};

const CodeBlockHead = (props: { block: Block }) => {
  switch (props.block._type) {
    case "repeat":
      return (
        <>
          Repeat
          <CodeBlockHighlight>{props.block.times}</CodeBlockHighlight>
          times
        </>
      );
    case "ifContainsBall":
      return (
        <>
          If <CodeBlockHighlight>{props.block.target}</CodeBlockHighlight>
          contains
          <span
            className={`code-block__colored-ball code-block__colored-ball--${props.block.ballColor}`}
          />
        </>
      );
    case "swap":
      return (
        <>
          Swap
          <CodeBlockHighlight>{props.block.cups[0] + 1}</CodeBlockHighlight>
          with
          <CodeBlockHighlight>{props.block.cups[1] + 1}</CodeBlockHighlight>
        </>
      );
  }
};

export const ProgramBlock = (props: ProgramProps) => {
  return (
    <>
      {props.program.map((child, index) => {
        const highlighted =
          index === props.highlighted?.[0] ? props.highlighted?.slice(1) : null;

        return (
          <CodeBlock highlighted={highlighted} block={child} key={index} />
        );
      })}
    </>
  );
};

const ElseContinution = (props: ElseContinuationProps) => {
  return (
    <>
      <div className="code-block__title">Else</div>
      <div className="code-block__children">
        <ProgramBlock
          program={props.block.otherwise}
          highlighted={
            props.highlighted?.map((e, i) =>
              i === 0 ? e - props.block.then.length : e
            ) ?? null
          }
        />
      </div>
    </>
  );
};

export const CodeBlock = (props: CodeBlockProps) => {
  return (
    <div
      className={[
        "code-block",
        `code-block--${blockColor(props.block)}`,
        props.highlighted?.length === 0 && "code-block--highlighted",
      ].join(" ")}
    >
      <div className="code-block__title">
        <CodeBlockHead block={props.block} />
      </div>
      <div className="code-block__children">
        <ProgramBlock
          highlighted={props.highlighted}
          program={blockChildren(props.block)}
        />
      </div>
      {props.block._type === "ifContainsBall" &&
        props.block.otherwise.length !== 0 && (
          <ElseContinution
            highlighted={props.highlighted}
            block={props.block}
          />
        )}
    </div>
  );
};
