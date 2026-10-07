import React from "react";
import Image from "next/image";

import { AccentLine } from "./SceneTypography";

const SCENE_4_IMAGE = "/images/box_bebiendo.jpg";

export function Scene4BodyEffort() {
  return (
    <section
      data-scene="4"
      className="scene-4-container absolute inset-0 w-full h-full flex items-center justify-start px-8 sm:px-16 md:px-24 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Escena Resistencia e Hidratación"
    >
      <div className="scene-4-bg absolute inset-0 w-full h-full overflow-hidden bg-[#101820]">
        <Image
          src={SCENE_4_IMAGE}
          alt="Atleta entrenando sentadilla con barra"
          fill
          sizes="100vw"
          className="object-cover object-[center_60%] sm:object-[center_58%]"
        />
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-r from-[#101820]/55 via-[#101820]/15 to-transparent" />
      </div>

      <div className="relative z-10 grid w-full">
      <div className="scene-4-content col-start-1 row-start-1 max-w-xl">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3 drop-shadow-md">
          03 / RESISTENCIA
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.05] text-[#F8F7F2] uppercase drop-shadow-lg">
          Tu cuerpo
          <br />
          <span className="font-semibold text-white">llega más lejos.</span>
        </h2>
        <AccentLine className="mt-6" />
      </div>
        <div className="scene-4-hydration col-start-1 row-start-1 max-w-xl opacity-0 motion-reduce:opacity-100 motion-reduce:row-start-2 motion-reduce:mt-8">
          <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3 drop-shadow-md">
            04 / VITALIDAD
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.05] text-[#F8F7F2] uppercase drop-shadow-lg">
            Hidratación
            <br />
            <span className="font-bold text-[#F7E2A3]">que impulsa.</span>
          </h2>
          <AccentLine className="mt-6" />
        </div>
      </div>
    </section>
  );
}
