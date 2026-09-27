"use client";

import React, { useEffect, useRef } from "react";
import { ScrollIndicator } from "./ScrollIndicator";

export function Scene1Intro() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.55;
    }
  }, []);

  return (
    <section
      data-scene="1"
      className="scene-1-container absolute inset-0 w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#101820] pointer-events-none select-none z-10"
      aria-label="Introducción USCHH"
    >
      {/* Background Video — cinematic dark treatment via overlay only (no CSS filter on video = better performance) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          className="scene-1-video w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.55;
          }}
        >
          <source src="/videos/TroteCaminadora.MOV" type="video/mp4" />
          <source src="/videos/TroteCaminadora.MOV" type="video/quicktime" />
        </video>

        {/* Dark gradient overlay — cinematic treatment without filter */}
        <div className="scene-1-overlay absolute inset-0 bg-black/15 bg-gradient-to-b from-[#101820]/60 via-[#101820]/25 to-[#101820]/70 pointer-events-none" />
      </div>

      {/* Top spacer for navbar */}
      <div className="pt-24" />

      {/* Centered Brand Mark — slot for official logo asset */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="scene-1-title text-7xl sm:text-9xl md:text-[13rem] lg:text-[16rem] font-black tracking-tighter text-[#F7E2A3] lowercase leading-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
          uschh
        </h1>
      </div>

      {/* Scroll Indicator */}
      <div className="scene-1-indicator relative z-10 pb-10 sm:pb-14">
        <ScrollIndicator />
      </div>
    </section>
  );
}
