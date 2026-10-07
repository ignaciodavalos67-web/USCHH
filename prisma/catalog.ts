// Initial creation only. Reseeding never overwrites an administrator's prices or stock.
export const initialProducts = [
  { slug: "limon", name: "USCHH Electrolitos Limón", flavor: "LIMÓN", price: "15.00", currency: "USD" },
  { slug: "mandarina", name: "USCHH Electrolitos Mandarina", flavor: "MANDARINA", price: "15.00", currency: "USD" },
] as const;
