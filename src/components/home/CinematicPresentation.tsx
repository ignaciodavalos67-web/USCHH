"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Scene1Intro } from "./Scene1Intro";
import { Scene2Movement } from "./Scene2Movement";
import { Scene3Discipline } from "./Scene3Discipline";
import { Scene4BodyEffort } from "./Scene4BodyEffort";
import { Scene6Minerals } from "./Scene6Minerals";
import { Scene8Philosophy } from "./Scene8Philosophy";
import { Scene9ProductReveal } from "./Scene9ProductReveal";
import { Scene10FinalCta } from "./Scene10FinalCta";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const SCROLL_DISTANCE = Math.round(8000 * (80 / 86));

export function CinematicPresentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      if (!containerRef.current || !stageRef.current) return;

      // -------------------------------------------------------
      // PERFORMANCE NOTES:
      // - Only animate opacity and transform (translate/scale)
      // - Do NOT animate filter/blur during scrub — moved to
      //   one-shot immediate effect on scene entry only
      // - Remove will-change from hidden elements
      // - Scenes fade in/out with opacity only during scrub
      // - Static blur on video handled via CSS class only
      // -------------------------------------------------------

      // Eight standalone scenes; Squad shares its background across two messages.
      // 86 to 80 timeline units; retain the original pixels-per-unit pacing.
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: stageRef.current,
          start: "top top",
          end: `+=${SCROLL_DISTANCE}`,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // ==========================================
      // SCENE 1 — INTRO (0 → 10)
      // Performance: animate only scale + opacity
      // blur effect is static CSS, removed from scrub
      // ==========================================
      masterTl
        .to(".scene-1-video", { scale: 1.02, duration: 10 }, 0)
        .to(".scene-1-title", { opacity: 0, y: -40, duration: 6 }, 0)
        .to(".scene-1-indicator", { opacity: 0, y: 15, duration: 4 }, 0)
        .to(".scene-1-container", { opacity: 0, duration: 3 }, 8);

      // ==========================================
      // SCENE 2 — MOVEMENT (8 → 19) [IMG_9516.jpg]
      // Performance: removed blur animation from scrub
      // ==========================================
      masterTl
        .fromTo(
          ".scene-2-container",
          { opacity: 0 },
          { opacity: 1, duration: 3 },
          8
        )
        .fromTo(
          ".scene-2-image",
          { scale: 1.02 },
          { scale: 1.0, duration: 8 },
          8
        )
        .fromTo(
          ".scene-2-content",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 4 },
          9
        )
        .to(".scene-2-content", { opacity: 0, y: -25, duration: 3 }, 16)
        .to(".scene-2-container", { opacity: 0, duration: 3 }, 17);

      // ==========================================
      // SCENE 3 — DISCIPLINE (16 → 27)
      // Performance: scale only on bg, no filters
      // ==========================================
      masterTl
        .fromTo(
          ".scene-3-container",
          { opacity: 0 },
          { opacity: 1, duration: 3 },
          16
        )
        .fromTo(
          ".scene-3-bg",
          { scale: 1.01 },
          { scale: 1.0, duration: 7 },
          16
        )
        .fromTo(
          ".scene-3-content",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 4 },
          17
        )
        .to(".scene-3-content", { opacity: 0, y: -25, duration: 3 }, 24)
        .to(".scene-3-container", { opacity: 0, duration: 3 }, 25);

      // ==========================================
      // SCENE 4 — SQUAD / EFFORT + HYDRATION (24 → 40)
      // ==========================================
      masterTl
        .fromTo(
          ".scene-4-container",
          { opacity: 0 },
          { opacity: 1, duration: 3 },
          24
        )
        .fromTo(
          ".scene-4-bg",
          { scale: 1.01 },
          { scale: 1.0, duration: 16, ease: "none" },
          24
        )
        .fromTo(
          ".scene-4-content",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 4 },
          25
        )
        .to(".scene-4-content", { opacity: 0, y: -25, duration: 2 }, 30)
        .fromTo(
          ".scene-4-hydration",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 2.5 },
          31.5
        )
        .to(".scene-4-hydration", { opacity: 0, y: -25, duration: 3 }, 36)
        .to(".scene-4-container", { opacity: 0, duration: 3 }, 37);

      // ==========================================
      // SCENE 6 — MINERALS (36 → 53)
      // Performance: stagger opacity + simple translate only
      // ==========================================
      masterTl
        .fromTo(
          ".scene-6-container",
          { opacity: 0 },
          { opacity: 1, duration: 4 },
          36
        )
        .fromTo(
          ".scene-6-products",
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1.0, duration: 5 },
          36
        )
        .fromTo(
          ".scene-6-headline",
          { opacity: 0, y: -25 },
          { opacity: 1, y: 0, duration: 4 },
          37
        )
        // Minerals stagger in — translate + opacity only
        .fromTo(
          ".scene-6-mineral",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 4, stagger: 0.15 },
          37.5
        )
        .fromTo(
          ".scene-6-footer",
          { opacity: 0 },
          { opacity: 1, duration: 3 },
          40
        )
        // Subtle parallax on products — translate only, NO scale
        .to(".scene-6-can-left", { y: -30, duration: 8 }, 37)
        .to(".scene-6-can-right", { y: 30, duration: 8 }, 37)
        // Transition out
        .to(".scene-6-headline", { y: -20, opacity: 0, duration: 2.5 }, 49)
        .to(".scene-6-minerals-row", { y: -20, opacity: 0, duration: 2.5 }, 49.5)
        .to(".scene-6-footer", { y: -15, opacity: 0, duration: 2 }, 50)
        .to(".scene-6-container", { opacity: 0, duration: 3 }, 50);

      // ==========================================
      // SCENE 8 — PHILOSOPHY (49 → 63)
      // (Scene 7 removed; Scene 8 renamed in DOM but kept as .scene-8-*)
      // ==========================================
      masterTl
        .fromTo(
          ".scene-8-container",
          { opacity: 0 },
          { opacity: 1, duration: 4 },
          49
        )
        .fromTo(
          ".scene-8-content",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 4 },
          50
        )
        .to(".scene-8-content", { opacity: 0, y: -25, duration: 3 }, 59)
        .to(".scene-8-container", { opacity: 0, duration: 3 }, 60);

      // ==========================================
      // SCENE 9 — PRODUCT REVEAL (59 → 73)
      // Performance: scale on bg only, no filters
      // ==========================================
      masterTl
        .fromTo(
          ".scene-9-container",
          { opacity: 0 },
          { opacity: 1, duration: 4 },
          59
        )
        .fromTo(
          ".scene-9-bg",
          { scale: 1.02 },
          { scale: 1.0, duration: 10 },
          59
        )
        .fromTo(
          ".scene-9-headline",
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 4 },
          60
        )
        .fromTo(
          ".scene-9-duo",
          { opacity: 0, y: 20 },
          { opacity: 0.9, y: 0, duration: 5 },
          61
        )
        .to(".scene-9-container", { opacity: 0, duration: 3 }, 70);

      // ==========================================
      // SCENE 10 — FINAL CTA (69 → 80)
      // Real asset: IMG_9508.jpg
      // ==========================================
      masterTl
        .fromTo(
          ".scene-10-container",
          { opacity: 0 },
          { opacity: 1, pointerEvents: "auto", duration: 4 },
          69
        )
        .fromTo(
          ".scene-10-bg",
          { scale: 1.01 },
          { scale: 1.0, duration: 11 },
          69
        )
        .fromTo(
          ".scene-10-content",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 4 },
          70
        )
        .fromTo(
          ".scene-10-cta",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 3 },
          72
        );
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Reduced motion accessible fallback
  if (reducedMotion) {
    return (
      <main className="w-full bg-[#101820] text-[#F8F7F2]">
        {[
          Scene1Intro,
          Scene2Movement,
          Scene3Discipline,
          Scene4BodyEffort,
          Scene6Minerals,
          Scene8Philosophy,
          Scene9ProductReveal,
          Scene10FinalCta,
        ].map((SceneComponent, i) => (
          <div key={i} className="relative min-h-screen py-24">
            <SceneComponent />
          </div>
        ))}
      </main>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#101820]"
      style={{ height: `calc(100vh + ${SCROLL_DISTANCE}px)` }}
    >
      {/* Pinned Viewport Stage — all scenes stacked */}
      <div
        ref={stageRef}
        className="fixed top-0 left-0 w-full h-screen overflow-hidden select-none bg-[#101820]"
      >
        <Scene1Intro />
        <Scene2Movement />
        <Scene3Discipline />
        <Scene4BodyEffort />
        <Scene6Minerals />
        <Scene8Philosophy />
        <Scene9ProductReveal />
        <Scene10FinalCta />
      </div>
    </div>
  );
}
