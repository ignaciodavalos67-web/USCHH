export type StoreTheme = "night" | "day";

export const STORE_THEME_KEY = "uschh-store-theme";
export const STORE_THEME_ATTR = "data-store-theme";
export const STORE_ROOT_ATTR = "data-store-root";

/** The original light storefront is the default. */
export function readStoredTheme(): StoreTheme {
  try {
    return localStorage.getItem(STORE_THEME_KEY) === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

export function getStoreRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${STORE_ROOT_ATTR}]`);
}

export function applyStoreTheme(root: HTMLElement, theme: StoreTheme) {
  root.setAttribute(STORE_THEME_ATTR, theme);
}

/** Runs inside the storefront before its children are painted. */
export const STORE_THEME_SCRIPT = `(function(){var r=document.currentScript&&document.currentScript.parentElement;if(!r)return;var t="day";try{if(localStorage.getItem("${STORE_THEME_KEY}")==="night")t="night"}catch(e){}r.setAttribute("${STORE_THEME_ATTR}",t)})()`;
