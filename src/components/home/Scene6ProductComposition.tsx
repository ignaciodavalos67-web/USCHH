import React from "react";
import Image from "next/image";

interface MineralData {
  symbol: string;
  name: string;
  className: string;
  size: string;
}

export function Scene6ProductComposition() {
  const minerals: MineralData[] = [
    {
      symbol: "Na",
      name: "SODIO",
      className: "scene-6-node-na top-[18%] left-[8%] sm:left-[14%]",
      size: "w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44",
    },
    {
      symbol: "K",
      name: "POTASIO",
      className: "scene-6-node-k top-[14%] right-[8%] sm:right-[15%]",
      size: "w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40",
    },
    {
      symbol: "Mg",
      name: "MAGNESIO",
      className: "scene-6-node-mg top-[44%] left-[4%] sm:left-[10%] md:left-[18%]",
      size: "w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48",
    },
    {
      symbol: "Ca",
      name: "CALCIO",
      className: "scene-6-node-ca top-[46%] right-[4%] sm:right-[10%] md:right-[18%]",
      size: "w-30 h-30 sm:w-38 sm:h-38 md:w-44 md:h-44",
    },
    {
      symbol: "Zn",
      name: "ZINC",
      className: "scene-6-node-zn bottom-[10%] left-1/2 -translate-x-1/2",
      size: "w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40",
    },
  ];

  return (
    <section
      data-scene="6"
      className="scene-6-container absolute inset-0 w-full h-full flex flex-col items-center justify-between py-12 sm:py-16 px-6 overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Composición de Minerales USCHH"
    >
      {/* Background Environment — Warm USCHH Palette */}
      <div className="scene-6-bg absolute inset-0 w-full h-full bg-[#F8F7F2]">
        {/* Warm ambient depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#F7E2A3]/45 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle background silhouette of real product: grounded, but NOT dominant */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[360px] aspect-[4410/2480] opacity-15 pointer-events-none filter blur-[1px]">
          <Image
            src="/products/uschh-duo-sin-fondo.png"
            alt="USCHH Pack Silhouette"
            fill
            sizes="360px"
            className="object-contain"
          />
        </div>

        {/* Connecting delicate molecular line network */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 stroke-[#101820]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="20%" y1="28%" x2="50%" y2="82%" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="80%" y1="26%" x2="50%" y2="82%" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="22%" y1="58%" x2="78%" y2="58%" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="20%" y1="28%" x2="80%" y2="26%" strokeWidth="1" />
          <circle cx="50%" cy="52%" r="220" fill="none" strokeWidth="0.75" opacity="0.3" />
        </svg>
      </div>

      {/* Top Headline — Focused on Minerals */}
      <div className="scene-6-headline relative z-10 text-center max-w-2xl pt-8 sm:pt-4">
        <span className="block text-xs uppercase tracking-[0.3em] font-mono text-[#101820]/60 mb-2">
          COMPOSICIÓN ACTIVA
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#101820] uppercase leading-none">
          5 Minerales.
          <br />
          <span className="font-light text-[#101820]/80">1 Propósito.</span>
        </h2>
      </div>

      {/* The 5 Prominent Mineral Symbols Constellation */}
      <div className="scene-6-minerals absolute inset-0 w-full h-full pointer-events-none">
        {minerals.map((m) => (
          <div
            key={m.symbol}
            className={`absolute ${m.className} ${m.size} flex flex-col items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-[#101820]/15 shadow-xl will-change-transform`}
          >
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-mono tracking-tight text-[#101820] leading-none">
              {m.symbol}
            </span>
            <span className="mt-1 text-[9px] sm:text-[11px] md:text-xs tracking-[0.25em] font-bold text-[#101820]/75 uppercase">
              {m.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Separated Botanical Ingredient Note (Aloe Vera) */}
      <div className="relative z-10 pb-4 text-center">
        <span className="inline-block px-4 py-1.5 text-[10px] sm:text-xs font-mono tracking-widest uppercase border border-[#101820]/20 bg-white/50 text-[#101820]/80 rounded-full backdrop-blur-sm">
          + Aloe Vera Orgánico como ingrediente complementario
        </span>
      </div>
    </section>
  );
}
