import React from "react";
import Image from "next/image";

import { AccentLine } from "./SceneTypography";

const SCENE_3_IMAGE = "/images/trote_isbaella_ignacio.webp";

export function Scene3Discipline() {
  return (
    <section
      data-scene="3"
      className="scene-3-container absolute inset-0 w-full h-full flex items-center justify-end px-8 sm:px-16 md:px-24 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Escena Disciplina"
    >
      <div className="scene-3-bg absolute inset-0 w-full h-full overflow-hidden bg-[#101820]">
        <Image
          src={SCENE_3_IMAGE}
          alt="Isabella e Ignacio trotando al aire libre"
          fill
          sizes="100vw"
          className="object-cover object-[55%_35%] sm:object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-l from-[#101820]/70 via-[#101820]/30 to-[#101820]/20" />
      </div>

      <div className="scene-3-content relative z-10 max-w-xl text-right">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3 drop-shadow-md">
          02 / ENFOQUE
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.05] text-[#F8F7F2] uppercase drop-shadow-lg">
          Disciplina
          <br />
          <span className="font-semibold text-white">en cada detalle.</span>
        </h2>
        <div className="flex justify-end">
          <AccentLine className="mt-6" />
        </div>
      </div>
    </section>
  );
}
