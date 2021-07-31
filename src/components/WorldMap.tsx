import { route } from "preact-router";
import { useEffect } from "preact/hooks";
import { levelsList } from "../logic/levelsList";

import "../styles/levelSelector.css";

const GenerateLevelSelectorComponents = () => {
    return levelsList.map((_, i) => {
        return (
            <div
                className="levelSelector"
                key={`levelSelector${i}`}
                onClick={() => {
                    route(`/levels/${i}`);
                }}
            >
                {i + 1}
            </div>
        );
    });
};

export default () => {
    return <div>{GenerateLevelSelectorComponents()}</div>;
};
