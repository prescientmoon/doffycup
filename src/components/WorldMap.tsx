import { h } from "preact";
import { Link } from "wouter-preact";

import { useAppState } from "../logic/state";
import { levelsList } from "../logic/levelsList";

import "../styles/levelSelector.css";

const GenerateLevelSelectorComponents = () => {
  const [state, _] = useAppState();
  return levelsList.map((_, i) => {
    return (
      <Link
        href={state.completed >= i ? `/levels/${i}` : "/levels"}
        key={`levelSelector-${i}`}
        disabled={state.completed < i}
      >
        <a>
          <div
            className={`levelSelector ${
              state.completed >= i ? "" : "levelSelectorDisabled"
            }
                ${state.completed == i ? "levelUnlocked" : ""}
                `}
          >
            {i + 1}
          </div>
        </a>
      </Link>
    );
  });
};

export default () => {
  return (
    <div className="world-map-container">
      <div className="world-map">{GenerateLevelSelectorComponents()}</div>
      <div></div>
    </div>
  );
};
