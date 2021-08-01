import {
  Block,
  CodeBlockPath,
  ExecutionState,
  Program,
} from "src/types/Program";

export type InterpreterSnapshot = [CodeBlockPath, Block];

export function* interpretProgram(
  program: Program,
  state: ExecutionState
): Generator<InterpreterSnapshot> {
  for (let index = 0; index < program.length; index++) {
    const step = program[index];

    state.path.push(index);
    yield* interpretBlock(step, state);
    state.path.pop();
  }
}

export function* interpretBlock(
  block: Block,
  state: ExecutionState
): Generator<[CodeBlockPath, Block]> {
  yield [state.path, block];

  switch (block._type) {
    case "swap":
      const temp = state.cups[block.cups[0]];
      state.cups[block.cups[0]] = state.cups[block.cups[1]];
      state.cups[block.cups[1]] = temp;
      break;
    case "repeat":
      for (let step = 0; step < block.times; step++)
        yield* interpretProgram(block.program, state);
      break;
  }
}
