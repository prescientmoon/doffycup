import { VisualBlock } from "src/types/Program";
import "../styles/codeBlock.css";

interface CodeBlockProps {
  block: VisualBlock;
}

export const CodeBlock = (props: CodeBlockProps) => {
  return (
    <div className="code-block">
      <div className="code-block__title">{props.block.name}</div>
      {props.block.children.map((child, index) => (
        <CodeBlock block={child} key={index} />
      ))}
    </div>
  );
};
