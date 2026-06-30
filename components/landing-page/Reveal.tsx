"use client";
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type ElementType } from "react";

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Manual delay in ms (overrides step). */
  delay?: number;
  /** Stagger index — multiplied by 90ms to produce a uniform rhythm. */
  step?: number;
  as?: ElementType;
}

/** Uniform stagger step (ms) — keep in sync across all pages. */
export const REVEAL_STEP_MS = 90;

export const Reveal = ({
  children,
  delay,
  step,
  className = "",
  as: Tag = "div",
  style,
  ...rest
}: RevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const computedDelay = delay ?? (step ? step * REVEAL_STEP_MS : 0);
  const Component = Tag as ElementType;
  return (
    <Component
      ref={ref as any}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${computedDelay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
};
