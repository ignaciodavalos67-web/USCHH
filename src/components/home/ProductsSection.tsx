import Image from "next/image";
import Link from "next/link";
import shopStyles from "@/app/productos/shop.module.css";
import { ShopFooterLogo } from "@/components/layout/ShopFooterLogo";

export function ProductsSection() {
  return (
    <section
      id="productos"
      className="relative py-20 md:py-28 px-6 sm:px-10 lg:px-16"
      style={{
        backgroundColor: "var(--home-bg, #F8F7F2)",
        color: "var(--home-body, #55585E)",
        borderTop: "1px solid var(--home-border, rgba(16, 24, 32, 0.08))",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Grid: Info + Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span
              className="text-[11px] tracking-[.15em] uppercase mb-3 font-semibold"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "var(--home-body, #55585E)",
              }}
            >
              ELECTROLITOS FUNCIONALES
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05] mb-6"
              style={{ color: "var(--home-fg, #101820)" }}
            >
              TU HIDRATACIÓN,
              <br />
              <span>EN MOVIMIENTO.</span>
            </h2>

            <p
              className="text-base sm:text-lg leading-relaxed mb-7 font-normal"
              style={{ color: "var(--home-body, #55585E)" }}
            >
              Formulado con electrolitos biodisponibles que reponen exactamente lo que tu cuerpo pierde al sudar: sodio, potasio, magnesio, calcio y zinc con extracto de aloe vera.
            </p>

            {/* 3 Círculos negros al estilo de los elementos del empaque: 1 POUCH, 15 SACHETS, 6 G */}
            <div className="flex items-center gap-4 sm:gap-5 mb-8 select-none">
              <div
                className="w-[76px] h-[76px] sm:w-[82px] sm:h-[82px] rounded-full flex flex-col items-center justify-center text-center leading-none"
                style={{
                  border: "2.2px solid var(--home-fg, #101820)",
                  color: "var(--home-fg, #101820)",
                }}
              >
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight">1</span>
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-1"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  POUCH
                </span>
              </div>

              <div
                className="w-[76px] h-[76px] sm:w-[82px] sm:h-[82px] rounded-full flex flex-col items-center justify-center text-center leading-none"
                style={{
                  border: "2.2px solid var(--home-fg, #101820)",
                  color: "var(--home-fg, #101820)",
                }}
              >
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight">15</span>
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-1"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  SACHETS
                </span>
              </div>

              <div
                className="w-[76px] h-[76px] sm:w-[82px] sm:h-[82px] rounded-full flex flex-col items-center justify-center text-center leading-none"
                style={{
                  border: "2.2px solid var(--home-fg, #101820)",
                  color: "var(--home-fg, #101820)",
                }}
              >
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight">6 G</span>
              </div>
            </div>

            {/* Button Conoce nuestro producto */}
            <Link
              href="/nuestro-producto"
              className="inline-flex items-center justify-center font-bold text-xs sm:text-sm px-8 py-4 rounded-full uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all duration-200 w-fit shadow-md"
              style={{
                backgroundColor: "var(--home-btn-bg, #101820)",
                color: "var(--home-btn-fg, #F8F7F2)",
              }}
            >
              CONOCE NUESTRO PRODUCTO
            </Link>
          </div>

          {/* Right Column: 2 Product Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Card Limón */}
            <article className={shopStyles.card}>
              <Link
                href="/productos/limon"
                className={shopStyles.visual}
                style={{ backgroundColor: "#F7E2A3" }}
                aria-label="Ver USCHH Electrolitos — Limón"
              >
                <Image
                  src="/products/uschh-limon-sin-fondo-con-sombra.png"
                  alt="Envase USCHH Electrolitos en polvo sabor Limón"
                  fill
                  sizes="(max-width: 767px) 90vw, 46vw"
                  className={shopStyles.productImage}
                  priority
                />
              </Link>
              <div className={shopStyles.details}>
                <p className={shopStyles.eyebrow}>USCHH · Electrolitos en polvo</p>
                <h3
                  className="text-3xl font-semibold tracking-tight my-2"
                  style={{ color: "var(--home-fg, #101820)" }}
                >
                  Limón
                </h3>
                <Link
                  href="/productos/limon"
                  className={`${shopStyles.cta} ${shopStyles.ctaLimon}`}
                  aria-label="Ver producto Limón"
                >
                  VER PRODUCTO
                </Link>
              </div>
            </article>

            {/* Card Mandarina */}
            <article className={shopStyles.card}>
              <Link
                href="/productos/mandarina"
                className={shopStyles.visual}
                style={{ backgroundColor: "#EBC6A7" }}
                aria-label="Ver USCHH Electrolitos — Mandarina"
              >
                <Image
                  src="/products/uschh-mandarina-sin-fondo-con-sombra.png"
                  alt="Envase USCHH Electrolitos en polvo sabor Mandarina"
                  fill
                  sizes="(max-width: 767px) 90vw, 46vw"
                  className={shopStyles.productImage}
                  priority
                />
              </Link>
              <div className={shopStyles.details}>
                <p className={shopStyles.eyebrow}>USCHH · Electrolitos en polvo</p>
                <h3
                  className="text-3xl font-semibold tracking-tight my-2"
                  style={{ color: "var(--home-fg, #101820)" }}
                >
                  Mandarina
                </h3>
                <Link
                  href="/productos/mandarina"
                  className={`${shopStyles.cta} ${shopStyles.ctaMandarina}`}
                  aria-label="Ver producto Mandarina"
                >
                  VER PRODUCTO
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* Sello circular USCHH con logo oficial en el centro y atributos alrededor */}
        <div className="mt-12 md:mt-16 flex justify-center select-none">
          <div
            className="relative w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] flex items-center justify-center"
            style={{ color: "var(--home-fg, #101820)" }}
            aria-label="5 electrolitos clave, con aloe vera, 15 sachets de 6 g, hecho en Ecuador, disolución en 400 ml"
          >
            <svg
              viewBox="0 0 360 360"
              className="w-full h-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                {/* Arco superior en sentido horario (276°) */}
                <path
                  id="uschh-seal-top-arc"
                  d="M 86.32 284.04 A 140 140 0 1 1 273.68 284.04"
                  fill="none"
                />
                {/* Arco inferior en sentido antihorario para lectura natural (72°) */}
                <path
                  id="uschh-seal-bottom-arc"
                  d="M 93.01 299.73 A 148 148 0 0 0 266.99 299.73"
                  fill="none"
                />
              </defs>

              <text
                fill="currentColor"
                fontSize="10.5"
                fontWeight="600"
                letterSpacing="1.8px"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                <textPath
                  href="#uschh-seal-top-arc"
                  startOffset="50%"
                  textAnchor="middle"
                  textLength="644"
                  lengthAdjust="spacing"
                >
                  DISOLUCIÓN EN 400 ML • 5 ELECTROLITOS CLAVE • CON ALOE VERA • 15 SACHETS DE 6 G
                </textPath>
              </text>

              <text
                fill="currentColor"
                fontSize="10.5"
                fontWeight="600"
                letterSpacing="1.8px"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                <textPath
                  href="#uschh-seal-bottom-arc"
                  startOffset="50%"
                  textAnchor="middle"
                  textLength="174"
                  lengthAdjust="spacing"
                >
                  •   HECHO EN ECUADOR   •
                </textPath>
              </text>
            </svg>

            {/* Logo oficial verdadero de USCHH centrado */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShopFooterLogo className="w-[104px] sm:w-[118px] h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
