"use client";

import { useLayoutEffect, useRef } from "react";
import { InlineScript } from "./InlineScript";
import {
  STORE_ROOT_ATTR,
  STORE_THEME_SCRIPT,
  applyStoreTheme,
  readStoredTheme,
} from "./storeTheme";

/**
 * Contenedor de la tienda que aplica el tema guardado sin parpadeo:
 * - Carga completa / recarga: el script en línea marca el atributo antes de pintar.
 * - Navegación del lado del cliente hacia la tienda: useLayoutEffect lo aplica antes de pintar.
 * El layout de /productos persiste entre /productos y /productos/[slug], así que el modo se conserva.
 */
export function StoreThemeRoot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) applyStoreTheme(ref.current, readStoredTheme());
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      {...{ [STORE_ROOT_ATTR]: "" }}
      suppressHydrationWarning
    >
      <InlineScript html={STORE_THEME_SCRIPT} />
      {children}
    </div>
  );
}
