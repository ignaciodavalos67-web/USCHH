import Link from "next/link";
import { ShopFooterLogo } from "@/components/layout/ShopFooterLogo";

export function HomeFooter() {
  return (
    <footer
      className="w-full py-16 sm:py-20 px-6 sm:px-10 lg:px-16"
      style={{
        backgroundColor: "var(--home-footer-bg, #F7E2A3)",
        color: "var(--home-footer-fg, #101820)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Brand Column */}
          <div className="md:col-span-6 flex flex-col items-start">
            <Link
              href="/"
              aria-label="Volver al inicio"
              className="inline-block group"
              style={{ color: "var(--home-footer-logo, #101820)" }}
            >
              <ShopFooterLogo className="w-48 sm:w-60 md:w-72 h-auto group-hover:opacity-85 transition-opacity" />
            </Link>

            <div
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-md select-none"
              style={{
                fontFamily: "var(--font-geist-mono)",
                backgroundColor: "var(--home-footer-pill-bg, #101820)",
                color: "var(--home-footer-pill-fg, #F7E2A3)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7E2A3]" />
              <span>ELEVA TU POTENCIAL.</span>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 flex flex-col">
            <h4
              className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "var(--home-footer-fg, #101820)",
                opacity: 0.65,
              }}
            >
              EXPLORA USCHH
            </h4>
            <nav className="flex flex-col gap-3 font-bold text-sm tracking-wider uppercase" aria-label="Navegación del pie">
              <Link
                href="/productos"
                className="hover:translate-x-1 transition-all duration-200 inline-block w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                TIENDA
              </Link>
              <Link
                href="/nuestro-producto"
                className="hover:translate-x-1 transition-all duration-200 inline-block w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                NUESTRO PRODUCTO
              </Link>
              <Link
                href="/nosotros"
                className="hover:translate-x-1 transition-all duration-200 inline-block w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                NOSOTROS
              </Link>
              <a
                href="#comunidad"
                className="hover:translate-x-1 transition-all duration-200 inline-block w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                COMUNIDAD
              </a>
            </nav>
          </div>

          {/* Social & Contact Column */}
          <div className="md:col-span-3 flex flex-col">
            <h4
              className="text-xs font-bold tracking-widest uppercase mb-5"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "var(--home-footer-fg, #101820)",
                opacity: 0.65,
              }}
            >
              CONECTA CON NOSOTROS
            </h4>
            <div className="flex flex-col gap-3 font-bold text-sm tracking-wider uppercase">
              <a
                href="https://instagram.com/uschh.ec"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5 w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                INSTAGRAM <span className="text-xs font-normal">↗</span>
              </a>
              <a
                href="https://wa.me/593999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5 w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                WHATSAPP <span className="text-xs font-normal">↗</span>
              </a>
              <a
                href="mailto:contacto@uschh.com"
                className="hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1.5 w-fit"
                style={{ color: "var(--home-footer-fg, #101820)" }}
              >
                ESCRÍBENOS <span className="text-xs font-normal">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-14 mb-8"
          style={{ borderTop: "1px solid var(--home-footer-border, rgba(16, 24, 32, 0.15))" }}
        />

        {/* Bottom Legal Row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wider"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: "var(--home-footer-fg, #101820)",
            opacity: 0.8,
          }}
        >
          <p>© 2026 USCHH · HECHO EN ECUADOR</p>
          <p className="hover:opacity-100 transition-opacity">
            POLÍTICA DE DEVOLUCIONES Y REEMBOLSOS
          </p>
        </div>
      </div>
    </footer>
  );
}
