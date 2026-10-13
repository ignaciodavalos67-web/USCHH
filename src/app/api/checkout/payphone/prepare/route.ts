import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError, payphoneService, readBody, sameOrigin } from "@/server/commerce/checkout-api";
import { GUEST_COOKIE, requireSession } from "@/server/commerce/order-access";
import { CheckoutError } from "@/lib/checkout/validation";

const PREPARE_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

function checkPrepareRateLimit(key: string) {
  const now = Date.now();
  const entry = PREPARE_RATE_LIMIT.get(key);

  if (!entry || now > entry.resetAt) {
    PREPARE_RATE_LIMIT.set(key, { count: 1, resetAt: now + 120_000 }); // 2 minute window
    return;
  }

  if (entry.count >= 6) {
    throw new CheckoutError(
      "RATE_LIMIT",
      "Demasiadas solicitudes de pago iniciadas. Por favor espera un momento.",
      429
    );
  }

  entry.count += 1;
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const guestHash = requireSession((await cookies()).get(GUEST_COOKIE)?.value);

    // Rate limit per guest session
    checkPrepareRateLimit(guestHash);

    const body = await readBody(request);
    const config = await payphoneService.prepare(body, guestHash);
    return NextResponse.json(config, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
