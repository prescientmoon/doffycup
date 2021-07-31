import {
  Block,
  CodeBlockPath,
  ExecutionState,
  Program,
} from "src/types/Program";

export function* interpretProgram(
  program: Program,
  state: ExecutionState
): Generator<CodeBlockPath> {
  for (let index = 0; index < program.length; index++) {
    const step = program[index];

    state.path.push(index);
    yield* interpretBlock(step, state);
    state.path.pop();
  }
}

export function* interpretBlock(block: Block, state: ExecutionState) {
  yield state.path;

  switch (block._type) {
    case "swap":
      const temp = state.cups[block.cups[0]];
      state.cups[block.cups[0]] = state.cups[block.cups[1]];
      state.cups[block.cups[1]] = temp;
      break;
    case "repeat":
      yield* interpretProgram(block.program, state);
      break;
  }
}
