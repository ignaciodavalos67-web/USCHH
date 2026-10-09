import Image from "next/image";
import Link from "next/link";
import shopStyles from "@/app/productos/shop.module.css";

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
              className="text-base sm:text-lg leading-relaxed mb-6 font-normal"
              style={{ color: "var(--home-body, #55585E)" }}
            >
              Formulado con electrolitos biodisponibles que reponen exactamente lo que tu cuerpo pierde al sudar: sodio, potasio, magnesio, calcio y zinc con extracto de aloe vera.
            </p>

            {/* Pouch Specification Pill */}
            <div
              className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold tracking-wider rounded-full px-4 py-2 w-fit mb-8 shadow-sm select-none"
              style={{
                fontFamily: "var(--font-geist-mono)",
                backgroundColor: "var(--home-surface, #FFFFFF)",
                border: "1px solid var(--home-border, rgba(16, 24, 32, 0.08))",
                color: "var(--home-fg, #101820)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#C28B00]" />
              <span>1 POUCH — 15 SACHETS DE 6 G</span>
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
                <span className={shopStyles.index} aria-hidden="true">
                  01 / USCHH
                </span>
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
                  VER PRODUCTO <span aria-hidden="true">↗</span>
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
                <span className={shopStyles.index} aria-hidden="true">
                  02 / USCHH
                </span>
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
                  VER PRODUCTO <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* Beneficios y electrolitos: limpio, minimalista, SIN EMOJIS */}
        <div
          className="mt-16 md:mt-20 rounded-xl md:rounded-full py-4 px-6 md:px-10 flex flex-wrap items-center justify-around gap-4 text-xs md:text-sm font-semibold tracking-widest uppercase shadow-sm select-none"
          style={{
            fontFamily: "var(--font-geist-mono)",
            backgroundColor: "var(--home-surface, #FFFFFF)",
            border: "1px solid var(--home-border, rgba(16, 24, 32, 0.08))",
            color: "var(--home-fg, #303236)",
          }}
        >
          <span>5 ELECTROLITOS CLAVE</span>
          <span style={{ opacity: 0.3 }} aria-hidden="true">·</span>
          <span>CON ALOE VERA</span>
          <span style={{ opacity: 0.3 }} aria-hidden="true">·</span>
          <span>15 SACHETS DE 6 G</span>
          <span style={{ opacity: 0.3 }} aria-hidden="true">·</span>
          <span>DISOLUCIÓN EN 400 ML</span>
          <span style={{ opacity: 0.3 }} aria-hidden="true">·</span>
          <span>HECHO EN ECUADOR</span>
        </div>
      </div>
    </section>
  );
}
