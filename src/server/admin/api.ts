import "server-only";
import { NextResponse } from "next/server";
import { AdminError } from "./errors";
import { CheckoutError } from "@/lib/checkout/validation";

export function adminApiError(error: unknown) {
  const known = error instanceof AdminError || error instanceof CheckoutError;
  if (!known) {
    const value = error as { name?: unknown; code?: unknown; meta?: { driverAdapterError?: { cause?: { originalCode?: unknown; kind?: unknown } } } };
    const safe = (field: unknown) => typeof field === "string" && /^[A-Za-z0-9_]{1,80}$/.test(field) ? field : undefined;
    // Never log messages, queries, parameters, credentials or authentication data.
    console.error("[admin] Operation failed " + JSON.stringify({
      name: safe(value?.name),
      code: safe(value?.code),
      databaseCode: safe(value?.meta?.driverAdapterError?.cause?.originalCode),
      kind: safe(value?.meta?.driverAdapterError?.cause?.kind),
    }));
  }
  return NextResponse.json({ error: known ? error.message : "No podemos completar la operación ahora. Inténtalo de nuevo." }, {
    status: known ? error.status : 503,
    headers: { "Cache-Control": "no-store" },
  });
}