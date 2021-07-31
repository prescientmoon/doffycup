import { route } from "preact-router";
import { useEffect } from "preact/hooks";

export default () => {
    useEffect(() => {
        route("/", true);
    });

    return (
        <div>
            <p>Not found, 404!</p>
            <p>You will be redirected soon.</p>
        </div>
    );
};
