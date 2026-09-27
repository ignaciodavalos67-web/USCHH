import React from "react";
import Image from "next/image";

// Replaceable visual slot: Replace with final performance athletic photography
const SCENE_7_IMAGE = "/images/placeholders/scene7-rendimiento.jpg";

export function Scene7Performance() {
  const pillars = [
    { label: "ENERGÍA", pos: "top-[25%] left-[8%] sm:left-[12%]" },
    { label: "FOCO", pos: "top-[20%] right-[8%] sm:right-[14%]" },
    { label: "RECUPERACIÓN", pos: "bottom-[28%] left-[6%] sm:left-[10%]" },
    { label: "RENDIMIENTO", pos: "bottom-[22%] right-[6%] sm:right-[12%]" },
    { label: "BIENESTAR", pos: "bottom-[12%] left-1/2 -translate-x-1/2" },
  ];

  return (
    <section
      data-scene="7"
      className="scene-7-container absolute inset-0 w-full h-full flex flex-col justify-between py-16 sm:py-20 px-8 sm:px-16 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Escena Rendimiento y Ciencia"
    >
      {/* Full-Screen Athletic Photography Background */}
      <div className="scene-7-bg absolute inset-0 w-full h-full overflow-hidden bg-[#101820]">
        <Image
          src={SCENE_7_IMAGE}
          alt="Atleta en carrera y esfuerzo físico desde ángulo posterior"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center will-change-transform"
        />

        {/* Cinematic dark vignette to give editorial polish and ensure copy readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/90 via-[#101820]/30 to-[#101820]/70" />
      </div>

      {/* Top Headline — Confident & Restrained */}
      <div className="scene-7-content relative z-10 max-w-2xl pt-6">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3 drop-shadow-md">
          05 / PROTOCOLO ACTIVO
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05] text-[#F8F7F2] uppercase drop-shadow-lg">
          Ciencia para un
          <br />
          <span className="font-bold text-white">mejor rendimiento.</span>
        </h2>
      </div>

      {/* Restrained Graphic System Around Athlete (Thin lines, small circles, #F7E2A3 accents — NO cards) */}
      <div className="scene-7-tags absolute inset-0 w-full h-full pointer-events-none">
        {pillars.map((item) => (
          <div
            key={item.label}
            className={`absolute ${item.pos} flex items-center gap-2.5 drop-shadow-md`}
          >
            {/* Small accent point */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7E2A3]" />
            <span className="w-6 sm:w-10 h-[1px] bg-[#F7E2A3]/50" />
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-[#F8F7F2] uppercase font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Editorial footer note */}
      <div className="relative z-10 pt-4 flex items-center justify-between border-t border-[#F8F7F2]/15 text-[10px] sm:text-xs font-mono text-[#F8F7F2]/50 tracking-wider">
        <span>* MARCADORES DE INVESTIGACIÓN</span>
        <span>CONTENIDO EDITORIAL EN REVISIÓN</span>
      </div>
    </section>
  );
}
