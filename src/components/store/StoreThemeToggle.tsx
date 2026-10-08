"use client";

import { useSyncExternalStore } from "react";
import styles from "./StoreThemeToggle.module.css";
import {
  STORE_THEME_ATTR,
  STORE_THEME_KEY,
  applyStoreTheme,
  getStoreRoot,
  type StoreTheme,
} from "./storeTheme";

function subscribe(onChange: () => void) {
  const root = getStoreRoot();
  if (!root) return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: [STORE_THEME_ATTR] });
  return () => observer.disconnect();
}

function getSnapshot(): StoreTheme {
  return getStoreRoot()?.getAttribute(STORE_THEME_ATTR) === "day" ? "day" : "night";
}

function getServerSnapshot(): StoreTheme {
  return "night";
}

/**
 * Botón de modo día/noche de la tienda. El icono visible lo decide el CSS a partir del
 * atributo del contenedor (sin parpadeo en hidratación); el estado solo alimenta la accesibilidad.
 * Sol = activar modo día (visible en noche). Luna = activar modo noche (visible en día).
 */
export function StoreThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const root = getStoreRoot();
    if (!root) return;
    const next: StoreTheme = getSnapshot() === "day" ? "night" : "day";
    applyStoreTheme(root, next);
    try {
      localStorage.setItem(STORE_THEME_KEY, next);
    } catch {
      /* localStorage no disponible: el modo se aplica solo a esta sesión */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={theme === "day" ? "Activar modo noche" : "Activar modo día"}
      title={theme === "day" ? "Modo noche" : "Modo día"}
    >
      <svg className={styles.sun} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className={styles.moon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
