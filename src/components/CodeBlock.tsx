import { ComponentChildren } from "preact";
import { Block, BlockColor, Program, VisualBlock } from "src/types/Program";
import { match } from "ts-adt";
import "../styles/codeBlock.css";

interface CodeBlockProps {
  block: Block;
}

const blockColor = (block: Block): BlockColor => {
  switch (block._type) {
    case "repeat":
      return "blue";
    case "swap":
      return "yellow";
  }
};

const blockChildren = (block: Block): Program => {
  switch (block._type) {
    case "repeat":
      return block.program;
    case "swap":
      return [];
  }
};

const CodeBlockHighlight = (props: { children: ComponentChildren }) => {
  return <span className="code-block__highlight">{props.children}</span>;
};

const CodeBlockHead = (props: CodeBlockProps) => {
  switch (props.block._type) {
    case "repeat":
      return (
        <>
          Repeat
          <CodeBlockHighlight>{props.block.times}</CodeBlockHighlight>
          times
        </>
      );
    case "swap":
      return (
        <>
          Swap
          <CodeBlockHighlight>{props.block.cups[0]}</CodeBlockHighlight>
          with
          <CodeBlockHighlight>{props.block.cups[1]}</CodeBlockHighlight>
        </>
      );
  }
};

export const CodeBlock = (props: CodeBlockProps) => {
  return (
    <div
      className={["code-block", `code-block--${blockColor(props.block)}`].join(
        " "
      )}
    >
      <div className="code-block__title">
        <CodeBlockHead block={props.block} />
      </div>
      <div className="code-block__children">
        {blockChildren(props.block).map((child, index) => (
          <CodeBlock block={child} key={index} />
        ))}
      </div>
    </div>
  );
};
