"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useCart } from "@/components/cart/CartProvider";
import { StoreThemeToggle } from "@/components/store/StoreThemeToggle";

export function Navbar({ storeTheme = false }: { storeTheme?: boolean }) {
  const cart = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    restoreScroll.current?.();
  }, []);

  function finishClose() {
    if (timer.current) clearTimeout(timer.current);
    dialog.current?.close();
    restoreScroll.current?.();
    restoreScroll.current = null;
    setOpen(false);
    setClosing(false);
  }

  function closeMenu() {
    if (closing) return;
    setClosing(true);
    timer.current = setTimeout(finishClose, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240);
  }

  function openMenu() {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    restoreScroll.current = () => { root.style.overflow = previousOverflow; };
    dialog.current?.showModal();
    setOpen(true);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex items-center justify-between pointer-events-auto mix-blend-difference text-[#F8F7F2] transition-opacity duration-300">
        <Link href="/" className={`${pathname !== "/" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} font-bold tracking-tight lowercase select-none hover:opacity-80 transition-opacity`} aria-label="USCHH — Inicio">uschh</Link>
        <div className={`flex items-center ${storeTheme ? "gap-1 sm:gap-4" : "gap-4"}`}>
        {storeTheme && <StoreThemeToggle />}
        <button type="button" onClick={() => { finishClose(); cart.openCart(); }} aria-label={`Abrir carrito, ${cart.count} unidades`} className="text-[11px] tracking-widest min-h-10 px-2 focus-visible:outline-2 focus-visible:outline-offset-4">CARRITO ({cart.count})</button>
        <button type="button" onClick={openMenu} aria-label="Abrir menú" aria-expanded={open} aria-controls="site-menu" aria-haspopup="dialog" className="group flex flex-col justify-center items-end gap-1.5 w-10 h-10 p-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4">
          <span className="block w-6 h-[1.5px] bg-[#F8F7F2] group-hover:w-7 transition-all duration-300" />
          <span className="block w-4 h-[1.5px] bg-[#F8F7F2] group-hover:w-7 transition-all duration-300" />
        </button>

        </div>
      </header>
      <dialog ref={dialog} id="site-menu" aria-label="Navegación principal" className={styles.overlay} data-closing={closing} onCancel={(event) => { event.preventDefault(); closeMenu(); }}>
        <div className={styles.top}>
          <Link href="/" onNavigate={finishClose} className={styles.brand} aria-label="USCHH — Inicio">uschh</Link>
          <button type="button" onClick={closeMenu} className={styles.close} aria-label="Cerrar menú"><span aria-hidden="true">×</span></button>
        </div>
        <nav className={styles.links} aria-label="Principal">
          <Link href="/" onNavigate={finishClose} aria-current={pathname === "/" ? "page" : undefined}>INICIO<span aria-hidden="true">↗</span></Link>
          <Link href="/nuestro-producto" onNavigate={finishClose} aria-current={pathname.startsWith("/nuestro-producto") ? "page" : undefined}>NUESTRO PRODUCTO<span aria-hidden="true">↗</span></Link>
          <Link href="/productos" onNavigate={finishClose} aria-current={pathname.startsWith("/productos") ? "page" : undefined}>TIENDA<span aria-hidden="true">↗</span></Link>
          <Link href="/nosotros" onNavigate={finishClose} aria-current={pathname.startsWith("/nosotros") ? "page" : undefined}>NOSOTROS<span aria-hidden="true">↗</span></Link>
        </nav>
        <p className={styles.footer}>USCHH · HECHO EN ECUADOR</p>
      </dialog>
    </>
  );
}
