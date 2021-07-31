import { route } from "preact-router";

import "../styles/homepage.css";

export default () => {
    return (
        <div className="homePage">
            <div
                className="menuButton"
                onClick={() => {
                    route("/levels", true);
                }}
            >
                PLAY
            </div>
            <div
                className="menuButton"
                onClick={() => {
                    route("/levels", true);
                }}
            >
                Change Language (not working yet)
            </div>
        </div>
    );
};
