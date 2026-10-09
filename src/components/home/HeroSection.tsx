"use client";

import Link from "next/link";
import { useCallback } from "react";

export function HeroSection() {
  const handleScrollDown = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("productos");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#101820] font-sans">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-[1.02]"
        >
          <source src="/videos/TroteCaminadora.MOV" type="video/mp4" />
          <source src="/videos/Bulgarian.MOV" type="video/mp4" />
        </video>
        {/* Dark overlay for contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#101820]/75 via-[#101820]/50 to-[#101820]/90 pointer-events-none" />
      </div>

      {/* Spacer to balance fixed header */}
      <div className="h-24 md:h-32 pointer-events-none" />

      {/* Hero Content — Sin subtítulo, manteniendo título grande y botón */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 text-center flex flex-col items-center justify-center my-auto">
        <h1 className="font-extrabold uppercase tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.98] sm:leading-[0.95] mb-10 drop-shadow-md">
          <span className="block text-white">ELEVA TU</span>
          <span className="block text-[#F7E2A3]">POTENCIAL</span>
        </h1>

        <Link
          href="/productos"
          className="inline-flex items-center justify-center bg-[#F7E2A3] text-[#101820] font-bold text-sm sm:text-base px-10 py-4 rounded-full uppercase tracking-wider hover:bg-[#ffe27a] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-black/40"
        >
          SHOP USCHH
        </Link>
      </div>

      {/* Bottom Bar Info */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-8 pt-4 flex items-center justify-between text-xs sm:text-sm uppercase tracking-widest font-semibold">
        {/* HECHO EN ECUADOR con letras coloreadas (ECU amarillo, AD azul, OR rojo) */}
        <div className="flex items-center gap-1 select-none text-white/90 font-bold tracking-wider">
          <span>HECHO EN</span>{" "}
          <span style={{ color: "#FFD100" }}>ECU</span>
          <span style={{ color: "#0072CE" }}>AD</span>
          <span style={{ color: "#ED1C24" }}>OR</span>
        </div>

        {/* DESLIZA HACIA ABAJO ↓ — discreto y elegante */}
        <a
          href="#productos"
          onClick={handleScrollDown}
          className="flex items-center gap-1.5 text-white/70 hover:text-[#F7E2A3] transition-colors cursor-pointer group select-none text-xs tracking-widest font-medium"
        >
          <span>DESLIZA HACIA ABAJO</span>
          <span className="transform group-hover:translate-y-1 transition-transform inline-block">↓</span>
        </a>
      </div>
    </section>
  );
}
