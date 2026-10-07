"use client";

import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || media.matches || !("IntersectionObserver" in window)) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!media.matches) animation = el.animate(
        [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 650, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
      );
      observer.unobserve(el);
    }, { threshold: 0.1 });
    const cancelMotion = () => { if (media.matches) animation?.cancel(); };
    media.addEventListener("change", cancelMotion);
    observer.observe(el);
    return () => { observer.disconnect(); animation?.cancel(); media.removeEventListener("change", cancelMotion); };
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}
