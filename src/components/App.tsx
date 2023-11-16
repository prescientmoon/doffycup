import { h } from "preact";
import { Link, Route, Router } from "wouter-preact";

import WorldMap from "./WorldMap";
import NotFound from "./NotFound";
import Homepage from "./Homepage";
import Level from "./Level";
import Home from "../icons/home";
import LevelsIcon from "../icons/levels";
import { AppContext, useStateReducer } from "../logic/state";

import "../styles/app.css";

export function App() {
  const context = useStateReducer();

  return (
    <AppContext.Provider value={context}>
      <Router base={process.env.BASEURL}>
        <div>
          <div className="miniNavbar">
            <Link href="/">
              <a className="link">
                <Home />
              </a>
            </Link>
            <Link href="/levels">
              <a className="link">
                <LevelsIcon />
              </a>
            </Link>
          </div>

          <div className="appContent">
            <Route path="/" component={Homepage} />
            <Route path="/levels" component={WorldMap} />
            <Route path="/levels/:levelNumber">
              {(props) => (
                // We set the key so the component is evaluated from scratch
                // (our scuffed animation system breaks otherwise)
                <Level
                  key={props.levelNumber}
                  levelNumber={props.levelNumber}
                />
              )}
            </Route>
            <Route component={NotFound} />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}
