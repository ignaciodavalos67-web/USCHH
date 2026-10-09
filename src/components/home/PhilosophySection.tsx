import Image from "next/image";
import Link from "next/link";

export function PhilosophySection() {
  return (
    <section
      className="relative py-20 md:py-32 px-6 sm:px-10 lg:px-16 overflow-hidden"
      style={{
        backgroundColor: "var(--home-bg, #F8F7F2)",
        color: "var(--home-body, #55585E)",
        borderTop: "1px solid var(--home-border, rgba(16, 24, 32, 0.08))",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        {/* Left Column: Big Brand Symbol */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] transition-transform duration-700 hover:scale-[1.03]">
            <Image
              src="/images/uschh-symbol-yellow.png"
              alt="Símbolo oficial USCHH"
              fill
              className="object-contain drop-shadow-[0_8px_30px_rgba(247,226,163,0.35)]"
              sizes="(max-width: 768px) 320px, 420px"
            />
          </div>
        </div>

        {/* Right Column: Philosophy Editorial */}
        <div className="w-full md:w-1/2 flex flex-col justify-center text-left">
          <span
            className="text-[11px] tracking-[.15em] uppercase mb-4 font-semibold"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: "var(--home-body, #55585E)",
            }}
          >
            NUESTRA FILOSOFÍA
          </span>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6"
            style={{ color: "var(--home-fg, #101820)" }}
          >
            CADA INGREDIENTE
            <br />
            <span>TIENE UNA RAZÓN.</span>
          </h2>

          <p
            className="text-base sm:text-lg leading-relaxed mb-6 font-normal"
            style={{ color: "var(--home-body, #55585E)" }}
          >
            En USCHH creemos que la suplementación debe ser honesta, eficaz y transparente. No formulamos para llenar espacio ni seguimos tendencias pasajeras: cada mineral y electrolito cumple un rol fisiológico concreto para acompañar tu esfuerzo.
          </p>

          <p
            className="text-sm sm:text-base leading-relaxed mb-9 font-normal"
            style={{ color: "var(--home-body, #55585E)", opacity: 0.9 }}
          >
            Creamos productos para personas que no negocian su disciplina, sea en la pista, en el gimnasio o en el ritmo del día a día. Tu cuerpo exige precisión; nosotros entregamos calidad.
          </p>

          <div>
            <Link
              href="/nosotros"
              className="inline-flex items-center justify-center font-bold text-xs sm:text-sm px-9 py-4 rounded-full uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
              style={{
                backgroundColor: "var(--home-btn-bg, #101820)",
                color: "var(--home-btn-fg, #F8F7F2)",
              }}
            >
              CONOCE A USCHH
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
