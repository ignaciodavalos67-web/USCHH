import React from "react";
import Image from "next/image";
import { AccentLine } from "./SceneTypography";

const SCENE_8_IMAGE = "/images/placeholders/scene8-filosofia.jpg";

export function Scene8Philosophy() {
  return (
    <section
      data-scene="8"
      className="scene-8-container absolute inset-0 w-full h-full flex items-center justify-center px-8 sm:px-16 md:px-24 text-center overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Filosofía de Marca USCHH"
    >
      {/* Warm editorial landscape — subtle fade gives text generous breathing room */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#F8F7F2]">
        <Image
          src={SCENE_8_IMAGE}
          alt="Paisaje exterior al amanecer con atleta de resistencia"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Heavy off-white veil: image shows through as warm depth, not as a distracting photo */}
        <div className="absolute inset-0 bg-[#F8F7F2]/85" />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        {/* Soft warm center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#F7E2A3]/25 pointer-events-none" />
      </div>

      {/* Editorial Manifesto */}
      <div className="scene-8-content relative z-10 max-w-4xl flex flex-col items-center">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#101820]/50 mb-6">
          FILOSOFÍA USCHH
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#101820] leading-[1.15]">
          No se trata de rendir más,
          <br />
          <span className="font-bold relative inline-block text-[#101820] mt-1 sm:mt-2">
            sino de rendir mejor.
            <span className="absolute bottom-1 left-0 right-0 h-[6px] sm:h-[8px] bg-[#F7E2A3] -z-10 rounded-sm" />
          </span>
        </h2>

        <AccentLine className="bg-[#101820] my-8 sm:my-10 mx-auto" />

        <p className="text-base sm:text-xl md:text-2xl font-light text-[#101820]/80 leading-relaxed max-w-2xl">
          En Uschh, cada ingrediente tiene una razón,
          <br className="hidden sm:inline" />
          cada fórmula un propósito
          <br className="hidden sm:inline" />
          y cada producto un impacto real.
        </p>
      </div>
    </section>
  );
}
