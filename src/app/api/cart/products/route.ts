import { getStorefrontProducts } from "@/server/storefront";
export async function GET() {
  const result = await getStorefrontProducts();
  return Response.json(result, { status: result.available ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
