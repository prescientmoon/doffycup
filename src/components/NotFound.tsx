import { useEffect } from "preact/hooks";
import { h } from "preact";
import { useLocation } from "wouter-preact";

export default () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/");
  });

  return (
    <div>
      <p>Not found, 404!</p>
      <p>You will be redirected soon.</p>
    </div>
  );
};
