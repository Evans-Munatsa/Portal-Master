import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { REVEAL_STEP_MS } from "@/components/Reveal";

/**
 * Temporary animation debug overlay.
 * - Lists every .reveal element on the page with its computed transitionDelay,
 *   inferred step index, visibility state, and distance from viewport.
 * - Tracks route phase transitions (enter/exit) and durations.
 *
 * Toggle with the "D" key, or via the floating button. Remove this file when
 * verification is done.
 */
export const AnimationDebugOverlay = () => {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [tick, setTick] = useState(0);
  const [reveals, setReveals] = useState<
    { idx: number; delayMs: number; step: number; visible: boolean; topPx: number; tag: string }[]
  >([]);
  const [routeLog, setRouteLog] = useState<
    { path: string; phase: "enter" | "exit"; at: number; durationMs?: number }[]
  >([]);

  // Keyboard toggle (D)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && /input|textarea|select/i.test(target.tagName)) return;
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Sample reveal nodes ~4x/sec while open
  useEffect(() => {
    if (!open) return;
    const sample = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
      setReveals(
        nodes.map((el, idx) => {
          const cs = window.getComputedStyle(el);
          // transition-delay can be a comma-separated list — take the max
          const delayMs = cs.transitionDelay
            .split(",")
            .map((s) => parseFloat(s) * (s.trim().endsWith("ms") ? 1 : 1000))
            .reduce((a, b) => Math.max(a, b), 0);
          const step = Math.round(delayMs / REVEAL_STEP_MS);
          const rect = el.getBoundingClientRect();
          return {
            idx,
            delayMs: Math.round(delayMs),
            step,
            visible: el.classList.contains("is-visible"),
            topPx: Math.round(rect.top),
            tag: (el.tagName + (el.dataset.label ? `[${el.dataset.label}]` : "")).toLowerCase(),
          };
        })
      );
      setTick((t) => t + 1);
    };
    sample();
    const id = window.setInterval(sample, 250);
    return () => window.clearInterval(id);
  }, [open, location.key]);

  // Track route phase transitions by watching for .route-enter / .route-exit on body's first child
  useEffect(() => {
    if (!open) return;
    let lastPhase: "enter" | "exit" | null = null;
    let phaseStart = performance.now();
    const tickFn = () => {
      const node = document.querySelector(".route-enter, .route-exit") as HTMLElement | null;
      const phase: "enter" | "exit" | null = node?.classList.contains("route-exit")
        ? "exit"
        : node?.classList.contains("route-enter")
        ? "enter"
        : null;
      if (phase && phase !== lastPhase) {
        const now = performance.now();
        setRouteLog((log) => {
          const next = [...log];
          if (lastPhase && next.length) {
            next[next.length - 1] = { ...next[next.length - 1], durationMs: Math.round(now - phaseStart) };
          }
          next.push({ path: location.pathname, phase, at: Math.round(now) });
          return next.slice(-8);
        });
        lastPhase = phase;
        phaseStart = now;
      }
    };
    const id = window.setInterval(tickFn, 60);
    return () => window.clearInterval(id);
  }, [open, location.pathname]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full bg-black/80 px-3 py-1.5 text-[11px] font-mono text-white shadow-lg backdrop-blur"
        title="Show animation debug (D)"
      >
        anim·debug
      </button>
    );
  }

  const inViewCount = reveals.filter((r) => r.topPx < window.innerHeight && r.topPx > -200).length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[340px] max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-black/85 p-3 font-mono text-[11px] text-white shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">anim·debug</div>
        <div className="flex items-center gap-2 text-white/60">
          <span>step={REVEAL_STEP_MS}ms</span>
          <span>{location.pathname}</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded bg-white/10 px-1.5 py-0.5 hover:bg-white/20"
            title="Hide (D)"
          >
            ×
          </button>
        </div>
      </div>

      <div className="mt-2 border-t border-white/10 pt-2">
        <div className="mb-1 text-white/60">route phases (last 8)</div>
        {routeLog.length === 0 && <div className="text-white/40">— navigate to capture —</div>}
        {routeLog.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span className={r.phase === "exit" ? "text-amber-300" : "text-emerald-300"}>
              {r.phase}
            </span>
            <span className="text-white/70">{r.path}</span>
            <span className="text-white/50">{r.durationMs ?? "…"}ms</span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-white/10 pt-2">
        <div className="mb-1 flex justify-between text-white/60">
          <span>reveals ({reveals.length}) · in-view {inViewCount}</span>
          <span>tick {tick}</span>
        </div>
        <div className="grid grid-cols-[auto_auto_auto_auto_1fr] gap-x-2 gap-y-0.5">
          <div className="text-white/40">#</div>
          <div className="text-white/40">step</div>
          <div className="text-white/40">delay</div>
          <div className="text-white/40">vis</div>
          <div className="text-white/40">top</div>
          {reveals.map((r) => (
            <div key={r.idx} className="contents">
              <div className="text-white/50">{r.idx}</div>
              <div>{r.step}</div>
              <div>{r.delayMs}ms</div>
              <div className={r.visible ? "text-emerald-300" : "text-white/40"}>
                {r.visible ? "✓" : "·"}
              </div>
              <div className="text-white/60">{r.topPx}px</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-white/40">
        press D to toggle · temporary
      </div>
    </div>
  );
};
