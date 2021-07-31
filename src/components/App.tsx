import { Router } from "preact-router";
import { CodeBlock } from "./CodeBlock";

export function App() {
  return (
    <>
      <CodeBlock
        block={{
          color: "red",
          name: "My first block",
          children: [],
        }}
      />
    </>
  );
}
