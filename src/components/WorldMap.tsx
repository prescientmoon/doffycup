import { route } from "preact-router";
import { useEffect } from "preact/hooks";
import { useAppState } from "../logic/state";
import { levelsList } from "../logic/levelsList";

import "../styles/levelSelector.css";

const GenerateLevelSelectorComponents = () => {
    const [state, setState] = useAppState();
    return levelsList.map((_, i) => {
        return (
            <div
                className={`levelSelector ${
                    state.completed >= i ? "" : "levelSelectorDisabled"
                }
                ${state.completed == i ? "levelUnlocked" : ""}
                `}
                key={`levelSelector${i}`}
                onClick={
                    state.completed >= i
                        ? () => {
                              route(`/levels/${i}`);
                          }
                        : () => {}
                }
            >
                {i + 1}
            </div>
        );
    });
};

export default () => {
    return <div>{GenerateLevelSelectorComponents()}</div>;
};
