/**
 * Script en línea que solo se ejecuta en la carga completa (HTML del servidor).
 * En el cliente se emite como text/plain para evitar el aviso de React sobre
 * etiquetas <script>; suppressHydrationWarning absorbe la diferencia de `type`.
 * Patrón de la guía "Preventing flash before hydration" de Next.js.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
