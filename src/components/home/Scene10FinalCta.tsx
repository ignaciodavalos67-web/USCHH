import React from "react";
import Image from "next/image";

import Link from "next/link";

export function Scene10FinalCta() {
  const attributes = [
    "VEGANO",
    "SIN AZÚCAR",
    "SIN GLUTEN",
    "SIN COLORANTES ARTIFICIALES",
  ];

  return (
    <section
      data-scene="10"
      className="scene-10-container absolute inset-0 w-full h-full flex flex-col justify-between py-16 sm:py-20 px-8 sm:px-16 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Cierre y Compra USCHH"
    >
      {/* Background Image: IMG_9508.jpg */}
      <div className="scene-10-bg absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src="/images/IMG_9508.jpg"
          alt="Atleta USCHH en descanso y potencial"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center will-change-transform"
        />
        {/* Deep cinematic overlay with warm atmospheric tint */}
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-[#101820]/95 via-[#101820]/60 to-[#101820]/75" />
      </div>

      {/* Top Brand Mark */}
      <div className="relative z-10 pt-8 sm:pt-12 text-center">
        <span className="text-3xl sm:text-5xl font-black lowercase tracking-tighter text-[#F7E2A3]">
          uschh
        </span>
      </div>

      {/* Main Center Call To Action */}
      <div className="scene-10-content relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto my-auto">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-none drop-shadow-lg">
          Eleva tu potencial
        </h2>

        <p className="mt-4 text-sm sm:text-base text-[#F8F7F2]/80 font-light max-w-lg">
          La nueva era de hidratación deportiva de alto rendimiento.
        </p>

        {/* Prominent CTA Button */}
        <div className="scene-10-cta mt-8 sm:mt-10 pointer-events-auto">
          <Link
            href="/productos"
            className="group inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-[#F7E2A3] text-[#101820] text-sm sm:text-base font-bold tracking-widest uppercase rounded-full shadow-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>SHOP USCHH</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Brand Attributes */}
        <div className="scene-10-badges flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-10 sm:mt-12">
          {attributes.map((attr) => (
            <span
              key={attr}
              className="px-3.5 py-1.5 text-[10px] sm:text-xs font-mono tracking-widest uppercase border border-[#F8F7F2]/25 bg-black/40 text-[#F8F7F2]/90 rounded-full backdrop-blur-md"
            >
              {attr}
            </span>
          ))}
        </div>
      </div>

      {/* Finish: HECHO EN ECUADOR */}
      <div className="relative z-10 flex items-center justify-center pt-4 border-t border-[#F8F7F2]/15">
        <span className="text-[11px] sm:text-xs font-mono tracking-[0.3em] uppercase text-[#F7E2A3]/90">
          HECHO EN {" "}<span className="text-[#FCD116]">ECU</span><span className="text-[#4080FF]">AD</span><span className="text-[#EF3340]">OR</span>
        </span>
      </div>
    </section>
  );
}
