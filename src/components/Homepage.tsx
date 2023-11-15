import { h } from "preact";
import { Link } from "wouter-preact";

import "../styles/homepage.css";

export default () => {
  return (
    <div className="home-page">
      <Link href="/levels">
        <div className="menuButton">PLAY</div>
      </Link>
    </div>
  );
};
