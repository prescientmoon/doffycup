import { route } from "preact-router";

import "../styles/homepage.css";

export default () => {
    return (
        <div className="home-page">
            <div
                className="menuButton"
                onClick={() => {
                    route("/levels", true);
                }}
            >
                PLAY
            </div>
        </div>
    );
};
