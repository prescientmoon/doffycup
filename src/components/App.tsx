import { Router, Route, route } from "preact-router";

import WorldMap from "./WorldMap";
import NotFound from "./NotFound";
import Homepage from "./Homepage";
import Level from "./Level";

import Home from "../icons/home";
import LevelsIcon from "../icons/levels";

import "../styles/app.css";
import { AppContext, initialState, updateState } from "../logic/state";
import { useImmerReducer } from "use-immer";

export function App() {
  const context: AppContext = useImmerReducer(updateState, initialState);

  return (
    <AppContext.Provider value={context}>
      <div>
        <div className="miniNavbar">
          <Home
            onClick={() => {
              route("/", true);
            }}
          ></Home>
          <LevelsIcon
            onClick={() => {
              route("/levels", true);
            }}
          ></LevelsIcon>
        </div>

        <div className="appContent">
          <Router>
            <Route path="/" component={Homepage} />
            <Route path="/levels" component={WorldMap} />
            <Route path="/levels/:levelNumber" component={Level} />
            <Route default component={NotFound} />
          </Router>
        </div>
      </div>
    </AppContext.Provider>
  );
}
