import { Router, Route } from "preact-router";

import WorldMap from "./WorldMap";
import NotFound from "./NotFound";
import Homepage from "./Homepage";
import Level from "./Level";

export function App() {
    return (
        <>
            Navbarhere?
            <Router>
                <Route path="/" component={Homepage} />
                <Route path="/levels" component={WorldMap} />
                <Route path="/levels/:levelNumber" component={Level} />
                <Route default component={NotFound} />
            </Router>
        </>
    );
}
