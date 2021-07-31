import { Router, Route } from "preact-router";

import WorldMap from "./WorldMap";
import NotFound from "./NotFound";
import Homepage from "./Homepage";
export function App() {
    return (
        <>
            Test
            <Router>
                <Route path="/" component={Homepage} />
                <Route path="/levels" component={WorldMap} />
                {/* <Route path="/levels/:id" component={Level} /> */}
                <Route default component={NotFound} />
            </Router>
        </>
    );
}
