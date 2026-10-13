// Initial creation only. Reseeding never overwrites an administrator's prices or stock.
export const initialProducts = [
  { slug: "limon", name: "USCHH Electrolitos Limón", flavor: "LIMÓN", price: "19.80", currency: "USD" },
  { slug: "mandarina", name: "USCHH Electrolitos Mandarina", flavor: "MANDARINA", price: "19.80", currency: "USD" },
] as const;
