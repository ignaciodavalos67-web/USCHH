export type StoreTheme = "night" | "day";

export const STORE_THEME_KEY = "uschh-store-theme";
export const STORE_THEME_ATTR = "data-store-theme";
export const STORE_ROOT_ATTR = "data-store-root";

/** Modo noche es el predeterminado: solo se marca el atributo para el modo día. */
export function readStoredTheme(): StoreTheme {
  try {
    return localStorage.getItem(STORE_THEME_KEY) === "day" ? "day" : "night";
  } catch {
    return "night";
  }
}

export function getStoreRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${STORE_ROOT_ATTR}]`);
}

export function applyStoreTheme(root: HTMLElement, theme: StoreTheme) {
  if (theme === "day") root.setAttribute(STORE_THEME_ATTR, "day");
  else root.removeAttribute(STORE_THEME_ATTR);
}

/** Se ejecuta durante el parseo del HTML, antes de pintar, sobre el contenedor de la tienda. */
export const STORE_THEME_SCRIPT = `(function(){try{var r=document.currentScript&&document.currentScript.parentElement;if(r&&localStorage.getItem("${STORE_THEME_KEY}")==="day")r.setAttribute("${STORE_THEME_ATTR}","day")}catch(e){}})()`;
