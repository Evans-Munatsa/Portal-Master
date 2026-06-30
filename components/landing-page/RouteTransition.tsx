import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * Wraps page content and plays a smooth enter/exit animation on route change.
 * Holds the previous children for ~320ms while playing the exit animation,
 * then swaps in the new route and plays the enter animation.
 */
export const RouteTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const firstRender = useRef(true);
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      prevKey.current = location.key;
      return;
    }
    if (prevKey.current === location.key) return;
    prevKey.current = location.key;

    setPhase("exit");
    const t = window.setTimeout(() => {
      setDisplayed(children);
      setPhase("enter");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 320);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Keep displayed in sync once we're in enter phase
  useEffect(() => {
    if (phase === "enter") setDisplayed(children);
  }, [children, phase]);

  return <div className={phase === "exit" ? "route-exit" : "route-enter"}>{displayed}</div>;
};
