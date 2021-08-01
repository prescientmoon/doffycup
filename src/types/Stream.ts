import { useEffect } from "preact/hooks";

/** Lazy effectful computation */
export type Effect<T> = () => T;

/** A stream implementation whch does not track effects (the return effect is a canceler) */
export type Stream<T> = (emit: (value: T) => void) => Effect<void>;

/** Create a stream and a function to push values onto that stream. */
export const create = <T>(): [Stream<T>, (value: T) => void] => {
  const subscribed = new Set<(value: T) => void>();

  const emit = (value: T) => {
    for (const subscriber of subscribed) {
      subscriber(value);
    }
  };

  const stream: Stream<T> = (emit) => {
    subscribed.add(emit);

    return () => {
      subscribed.delete(emit);
    };
  };

  return [stream, emit];
};

/** Subscribe to a stream inside a component (taking care of cancelation) */
export const useStream = <T>(
  stream: Stream<T>,
  handler: (v: T) => void,
  inputs: any[] = []
) => {
  useEffect(() => stream(handler), inputs);
};
