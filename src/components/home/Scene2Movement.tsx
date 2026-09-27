import React from "react";
import Image from "next/image";
import photography from "./ScenePhotography.module.css";
import { AccentLine } from "./SceneTypography";

const SCENE_2_IMAGE = "/images/IMG_9516.jpg";

export function Scene2Movement() {
  return (
    <section
      data-scene="2"
      className="scene-2-container absolute inset-0 w-full h-full flex items-center justify-start px-8 sm:px-16 md:px-24 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Escena Movimiento"
    >
      {/* Background: IMG_9516.jpg — no filter, scale only in GSAP */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#101820]">
        <Image
          src={SCENE_2_IMAGE}
          alt="Movimiento atlético USCHH"
          fill
          priority
          sizes="100vw"
          className={`${photography.portrait} scene-2-image object-cover object-center`}
        />
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-r from-[#101820]/80 via-[#101820]/40 to-transparent" />
      </div>

      <div className="scene-2-content relative z-10 max-w-xl">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3 drop-shadow-md">
          01 / RENDIMIENTO
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.05] text-[#F8F7F2] uppercase drop-shadow-lg">
          Movimiento
          <br />
          <span className="font-semibold text-white">que te define.</span>
        </h2>
        <AccentLine className="scene-2-line mt-6" />
      </div>
    </section>
  );
}
