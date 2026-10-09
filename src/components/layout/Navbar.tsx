"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useCart } from "@/components/cart/CartProvider";
import { StoreThemeToggle } from "@/components/store/StoreThemeToggle";

interface NavbarProps {
  storeTheme?: boolean;
  /**
   * En la nueva HOME, la navegación es ultra minimalista:
   * solo logo a la izquierda y el icono hamburguesa prominente a la derecha
   * (sin el botón exterior de CARRITO (0)). El carrito se accede dentro del menú.
   */
  minimal?: boolean;
}

export function Navbar({ storeTheme = false, minimal = false }: NavbarProps) {
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
    timer.current = setTimeout(
      finishClose,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240
    );
  }

  function openMenu() {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    restoreScroll.current = () => {
      root.style.overflow = previousOverflow;
    };
    dialog.current?.showModal();
    setOpen(true);
  }

  function handleOpenCart() {
    finishClose();
    cart.openCart();
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex items-center justify-between pointer-events-auto mix-blend-difference text-[#F8F7F2] transition-opacity duration-300">
        <Link
          href="/"
          className={`${
            pathname !== "/" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          } font-bold tracking-tight lowercase select-none hover:opacity-80 transition-opacity`}
          aria-label="USCHH — Inicio"
        >
          uschh
        </Link>

        <div className={`flex items-center ${storeTheme ? "gap-2 sm:gap-4" : "gap-3 sm:gap-4"}`}>
          {storeTheme && <StoreThemeToggle />}

          {/* Botón exterior de carrito: se conserva en tienda / páginas interiores; se oculta en HOME minimal */}
          {!minimal && (
            <button
              type="button"
              onClick={handleOpenCart}
              aria-label={`Abrir carrito, ${cart.count} unidades`}
              className="text-[11px] tracking-widest min-h-10 px-2 focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer"
            >
              CARRITO ({cart.count})
            </button>
          )}

          {/* Menú hamburguesa de tres líneas — más grande, visible y llamativo */}
          <button
            type="button"
            onClick={openMenu}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-haspopup="dialog"
            className="group flex flex-col justify-center items-end gap-[5px] w-12 h-12 p-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="block w-7 sm:w-8 h-[2px] bg-[#F8F7F2] group-hover:w-8 transition-all duration-300" />
            <span className="block w-5 sm:w-6 h-[2px] bg-[#F8F7F2] group-hover:w-8 transition-all duration-300" />
            <span className="block w-7 sm:w-8 h-[2px] bg-[#F8F7F2] group-hover:w-8 transition-all duration-300" />
          </button>
        </div>
      </header>

      <dialog
        ref={dialog}
        id="site-menu"
        aria-label="Navegación principal"
        className={styles.overlay}
        data-closing={closing}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className={styles.top}>
          <Link
            href="/"
            onClick={finishClose}
            className={styles.brand}
            aria-label="USCHH — Inicio"
          >
            uschh
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            className={styles.close}
            aria-label="Cerrar menú"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <nav className={styles.links} aria-label="Principal">
          <Link
            href="/"
            onClick={finishClose}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            INICIO
          </Link>
          <Link
            href="/productos"
            onClick={finishClose}
            aria-current={pathname.startsWith("/productos") ? "page" : undefined}
          >
            TIENDA
          </Link>
          <Link
            href="/nuestro-producto"
            onClick={finishClose}
            aria-current={pathname.startsWith("/nuestro-producto") ? "page" : undefined}
          >
            NUESTRO PRODUCTO
          </Link>
          <Link
            href="/nosotros"
            onClick={finishClose}
            aria-current={pathname.startsWith("/nosotros") ? "page" : undefined}
          >
            NOSOTROS
          </Link>

          {/* Acceso al carrito dentro del menú */}
          <button
            type="button"
            onClick={handleOpenCart}
            aria-label={`Abrir carrito (${cart.count})`}
          >
            <span>CARRITO</span>
            <span className={styles.cartCount}>({cart.count})</span>
          </button>
        </nav>

        <p className={styles.footer}>USCHH &middot; HECHO EN ECUADOR</p>
      </dialog>
    </>
  );
}
