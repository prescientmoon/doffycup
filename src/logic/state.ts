import { useContext, useRef, useState } from "preact/hooks";
import { createContext } from "preact";
import { ADT } from "ts-adt";

export interface AppState {
  completed: number;
}

export type AppAction = ADT<{
  completeLevel: {
    level: number;
  };
  loadState: {};
}>;

export const initialState: AppState = loadState();

export type AppContext = [AppState, (action: AppAction) => void];

export const AppContext = createContext<AppContext>([
  initialState,
  () => {
    throw new Error(`useAppState used outside a Provider`);
  },
]);

export const useAppState = () => useContext(AppContext);

const saveState = (state: AppState) => {
  localStorage.setItem("state", JSON.stringify(state));
};

function loadState(): AppState {
  const savedState = localStorage.getItem("state");
  const parsedSavedState = savedState === null ? {} : JSON.parse(savedState);

  return {
    completed: 0,
    ...parsedSavedState,
  };
}

const updateState = (state: AppState, action: AppAction): AppState => {
  switch (action._type) {
    case "loadState":
      return loadState();
    case "completeLevel":
      state.completed = action.level;
      break;
  }

  saveState(state);

  return state;
};

// Similar to using `useReducer` directly, but lets our `updateState`
// function mutate the state directly instead of having to copy each time.
export const useStateReducer = (): AppContext => {
  const state = useRef(initialState);

  // A simple way for us to manually trigger updates
  const [gen, setGen] = useState(0);

  const sendAction = (action: AppAction) => {
    state.current = updateState(state.current, action);
    setGen(gen + 1);
  };

  return [state.current, sendAction];
};
