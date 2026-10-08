"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollIndicator } from "./ScrollIndicator";
import { UschhMarquee } from "./UschhMarquee";

export function Scene1Intro() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const scene = video?.closest("section");
    if (!video || !scene) return;
    video.playbackRate = 0.55;

    // Pause video only when document is not visible
    const syncPlayback = () => {
      if (document.hidden) {
        if (!video.paused) video.pause();
      } else if (video.paused) {
        void video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <section
      data-scene="1"
      className="scene-1-container absolute inset-0 w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#101820] pointer-events-none select-none z-10"
      aria-label="Introducción USCHH"
    >
      {/* Background Video — cinematic dark treatment via overlay only */}
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
        <div className="scene-1-overlay absolute inset-0 bg-black/20 bg-gradient-to-b from-[#101820]/70 via-[#101820]/35 to-[#101820]/80 pointer-events-none" />
      </div>

      {/* Top spacer for navbar */}
      <div className="pt-16 sm:pt-20 md:pt-24" />

      {/* Centered Hero Content Group: Official Logo + Slogan + Shop Button + Marquee */}
      <div className="scene-1-title relative z-10 flex flex-col items-center text-center w-full my-auto">
        {/* Inner centered brand content */}
        <div className="flex flex-col items-center text-center px-4 max-w-4xl w-full">
          {/* 1. Official USCHH Logomark */}
          <div className="relative flex justify-center w-full">
            <Image
              src="/images/uschh-logo-yellow.png"
              alt="USCHH"
              width={804}
              height={278}
              priority
              quality={85}
              className="w-[230px] sm:w-[320px] md:w-[420px] lg:w-[520px] h-auto object-contain select-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
            />
            <h1 className="sr-only">USCHH - ELEVA TU POTENCIAL.</h1>
          </div>

          {/* 2. Protagonist Slogan: ELEVA TU POTENCIAL. */}
          <p className="mt-3.5 sm:mt-5 md:mt-6 text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[0.14em] sm:tracking-[0.18em] text-[#F8F7F2] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] leading-tight">
            ELEVA TU POTENCIAL.
          </p>

          {/* 3. Shop Button: SHOP USCHH */}
          <div className="mt-4.5 sm:mt-6 md:mt-7 pointer-events-auto">
            <Link
              href="/productos"
              className="group inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#F7E2A3] text-[#101820] text-xs sm:text-sm font-bold tracking-[0.16em] uppercase rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              aria-label="Comprar productos USCHH en la tienda"
            >
              <span>SHOP USCHH</span>
              <span
                className="group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              >
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* 4. Horizontal Marquee Bar — 100% screen width, continuous loop towards the right */}
        <div className="w-full mt-5 sm:mt-7 md:mt-9">
          <UschhMarquee />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scene-1-indicator relative z-10 pb-6 sm:pb-10">
        <ScrollIndicator />
      </div>
    </section>
  );
}
