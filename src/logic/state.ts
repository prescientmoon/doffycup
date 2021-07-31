import { createContext, useContext } from "react";
import { ADT } from "ts-adt";
import { Reducer } from "use-immer";

export interface AppState {
  completed: number;
}

export type AppAction = ADT<{
  completeLevel: {
    level: number;
  };
}>;

export const initialState: AppState = {
  completed: 0,
};

export const AppContext = createContext<
  [AppState, (action: AppAction) => void]
>([
  initialState,
  () => {
    throw new Error(`useAppState used outside a Provider`);
  },
]);

export const useAppState = () => useContext(AppContext);

export const updateState: Reducer<AppState, AppAction> = (state, action) => {
  switch (action._type) {
    case "completeLevel":
      state.completed = action.level;
      break;
  }
};
