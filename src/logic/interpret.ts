import {
  Block,
  CodeBlockPath,
  ExecutionState,
  Program,
} from "src/types/Program";

export type InterpreterSnapshot = [CodeBlockPath, Block];

export function* interpretProgram(
  program: Program,
  state: ExecutionState,
  offset = 0
): Generator<InterpreterSnapshot, ExecutionState["cups"]> {
  for (let index = 0; index < program.length; index++) {
    const step = program[index];

    state.path.push(index + offset);
    yield* interpretBlock(step, state);
    state.path.pop();
  }

  return state.cups;
}

export function* interpretBlock(
  block: Block,
  state: ExecutionState
): Generator<[CodeBlockPath, Block], ExecutionState["cups"]> {
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
    case "ifContainsBall":
      if (state.cups[block.target] === block.ballColor)
        yield* interpretProgram(block.then, state);
      else yield* interpretProgram(block.otherwise, state, block.then.length);
  }

  return state.cups;
}
