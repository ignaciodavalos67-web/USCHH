import React from "react";
import Image from "next/image";

export function Scene9ProductReveal() {
  return (
    <section
      data-scene="9"
      className="scene-9-container absolute inset-0 w-full h-full flex flex-col justify-between py-16 sm:py-20 px-8 sm:px-16 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Presentación de Producto USCHH"
    >
      {/* Real product photography background */}
      <div className="scene-9-bg absolute inset-0 w-full h-full overflow-hidden bg-[#101820]">
        <Image
          src="/products/uschh-duo-fondo-marca.jpg"
          alt="USCHH Duo Electrolitos en Fondo de Marca"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-[#101820]/90 via-transparent to-[#101820]/70" />
      </div>

      <div className="scene-9-headline relative z-10 max-w-3xl pt-8">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#F7E2A3] mb-3">
          DESCUBRE USCHH
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#F8F7F2] uppercase leading-[1.05]">
          Electrolitos diseñados
          <br />
          <span className="font-bold text-white">para rendir mejor.</span>
        </h2>
      </div>

      {/* Floating duo cutout for parallax depth */}
      <div className="scene-9-duo relative z-10 self-center max-w-2xl w-full h-48 sm:h-64 my-auto opacity-0 hidden sm:block">
        <Image
          src="/products/uschh-duo-sin-fondo.png"
          alt="USCHH Duo Cutout"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-contain drop-shadow-2xl"
        />
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[#F8F7F2]/20 pt-4 text-xs font-mono text-[#F8F7F2]/70 tracking-wider">
        <span>FÓRMULA HIPOALERGÉNICA</span>
        <span>MANDARINA / LIMÓN</span>
      </div>
    </section>
  );
}
