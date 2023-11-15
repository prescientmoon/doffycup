import { useContext } from "preact/hooks";
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

export const updateState = (
  state: AppState,
  action: AppAction,
): AppState | void => {
  switch (action._type) {
    case "loadState":
      return loadState();
    case "completeLevel":
      state.completed = action.level;
      break;
  }

  saveState(state);
};

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
