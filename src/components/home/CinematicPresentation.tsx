"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Scene1Intro } from "./Scene1Intro";
import { Scene2Movement } from "./Scene2Movement";
import { Scene6Minerals } from "./Scene6Minerals";
import { Scene8Philosophy } from "./Scene8Philosophy";
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

// 1800px scroll track: snappy, energetic, immediate progression across all 5 scenes
const SCROLL_DISTANCE = 1800;

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

      const videoEl = stageRef.current.querySelector<HTMLVideoElement>(".scene-1-video");

      // Master Scroll-Driven Scrub Timeline
      // scrub: 0.2 provides lightning-fast direct response with minimal drag
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: stageRef.current,
          start: "top top",
          end: `+=${SCROLL_DISTANCE}`,
          scrub: 0.2,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Free 100% of GPU video-decoding budget when scrolled past scene 1
            if (videoEl) {
              if (self.progress > 0.2 && !videoEl.paused) {
                videoEl.pause();
              } else if (self.progress <= 0.2 && videoEl.paused) {
                void videoEl.play().catch(() => {});
              }
            }
          },
        },
      });

      // ==========================================
      // SCENE 1 — INTRO (0 → 4.5)
      // Hero: Logo + ELEVA TU POTENCIAL. + SHOP USCHH + Marquee
      // ==========================================
      masterTl
        .to(".scene-1-title", { autoAlpha: 0, y: -30, duration: 2.5 }, 0)
        .to(".scene-1-indicator", { autoAlpha: 0, y: 15, duration: 1.8 }, 0)
        .to(".scene-1-container", { autoAlpha: 0, duration: 2 }, 2);

      // ==========================================
      // SCENE 2 — MOVEMENT (1.8 → 7.5)
      // Movimiento que te define.
      // Immediate seamless entry
      // ==========================================
      masterTl
        .fromTo(
          ".scene-2-container",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 2 },
          1.8
        )
        .fromTo(
          ".scene-2-content",
          { autoAlpha: 0, y: 25 },
          { autoAlpha: 1, y: 0, duration: 2.2 },
          2.2
        )
        .to(".scene-2-content", { autoAlpha: 0, y: -20, duration: 2 }, 5.2)
        .to(".scene-2-container", { autoAlpha: 0, duration: 2 }, 5.5);

      // ==========================================
      // SCENE 6 — MINERALS & FORMULATION (5.2 → 11.5)
      // 5 Minerales. 1 Propósito.
      // ==========================================
      masterTl
        .fromTo(
          ".scene-6-container",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 2 },
          5.2
        )
        .fromTo(
          ".scene-6-products",
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1.0, duration: 2.2 },
          5.5
        )
        .fromTo(
          ".scene-6-headline",
          { autoAlpha: 0, y: -15 },
          { autoAlpha: 1, y: 0, duration: 2 },
          5.5
        )
        .fromTo(
          ".scene-6-mineral",
          { autoAlpha: 0, y: 15 },
          { autoAlpha: 1, y: 0, duration: 2, stagger: 0.08 },
          5.8
        )
        .fromTo(
          ".scene-6-footer",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.8 },
          6.8
        )
        .to(".scene-6-headline", { autoAlpha: 0, y: -15, duration: 1.8 }, 9.2)
        .to(".scene-6-minerals-row", { autoAlpha: 0, y: -15, duration: 1.8 }, 9.5)
        .to(".scene-6-footer", { autoAlpha: 0, duration: 1.5 }, 9.5)
        .to(".scene-6-container", { autoAlpha: 0, duration: 2 }, 9.8);

      // ==========================================
      // SCENE 8 — PHILOSOPHY (9.5 → 15.5)
      // No se trata de rendir más, sino de rendir mejor.
      // ==========================================
      masterTl
        .fromTo(
          ".scene-8-container",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 2 },
          9.5
        )
        .fromTo(
          ".scene-8-content",
          { autoAlpha: 0, y: 25 },
          { autoAlpha: 1, y: 0, duration: 2.2 },
          10
        )
        .to(".scene-8-content", { autoAlpha: 0, y: -20, duration: 2 }, 13.2)
        .to(".scene-8-container", { autoAlpha: 0, duration: 2 }, 13.5);

      // ==========================================
      // SCENE 10 — FINAL CTA (13.2 → 19.0)
      // Eleva tu potencial · Shop USCHH
      // ==========================================
      masterTl
        .fromTo(
          ".scene-10-container",
          { autoAlpha: 0 },
          { autoAlpha: 1, pointerEvents: "auto", duration: 2 },
          13.2
        )
        .fromTo(
          ".scene-10-content",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 2.2 },
          13.8
        )
        .fromTo(
          ".scene-10-cta",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 1.8 },
          14.5
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
          Scene6Minerals,
          Scene8Philosophy,
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
      {/* Pinned Viewport Stage — 5 streamlined scenes */}
      <div
        ref={stageRef}
        className="fixed top-0 left-0 w-full h-screen overflow-hidden select-none bg-[#101820]"
      >
        <Scene1Intro />
        <Scene2Movement />
        <Scene6Minerals />
        <Scene8Philosophy />
        <Scene10FinalCta />
      </div>
    </div>
  );
}
