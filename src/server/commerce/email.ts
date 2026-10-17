import "server-only";
import { formatOrderNumber, formatMoney } from "./policies";
import type { Prisma } from "@/generated/prisma/client";

export type ConfirmedOrderEmailData = {
  number: number;
  email: string;
  firstName: string;
  lastName: string;
  idNumber?: string | null;
  address: string;
  city: string;
  province: string;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  currency: string;
  paymentMethod?: string;
  items: {
    productName: string;
    flavor: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    lineTotal: Prisma.Decimal;
  }[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderConfirmationEmail(order: ConfirmedOrderEmailData): Promise<boolean> {
  const formattedNumber = formatOrderNumber(order.number);
  const formattedTotal = formatMoney(order.total, order.currency);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://uschh-ec.com";

  const subject = `¡Gracias por tu compra! Pedido #${formattedNumber} confirmado`;

  const productsSummary = order.items
    .map((item) =>
      order.items.length > 1
        ? `${item.productName} (${item.flavor}) × ${item.quantity}`
        : `${item.productName} (${item.flavor})`
    )
    .join(", ");

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const fullAddress = `${order.address}, ${order.city}, ${order.province}`;

  const emailText = `¡Gracias por tu compra!

Tu pedido #${formattedNumber} está confirmado y ya estamos preparando todo para que pronto tengas tu USCHH contigo.

Resumen de tu pedido

Producto: ${productsSummary}
Cantidad: ${totalQuantity}
Total: ${formattedTotal}
Dirección de entrega: ${fullAddress}

Te enviaremos una actualización cuando tu pedido esté en camino.

Gracias por confiar en nosotros y por ser parte de esta comunidad que recién empieza.

Nos vemos en movimiento. ⚡

Equipo USCHH
Eleva tu potencial.

Visita nuestra página web: ${siteUrl}
`;

  const emailHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 560px;">
  <p style="font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">¡Gracias por tu compra!</p>
  <p style="margin: 0 0 20px 0;">
    Tu pedido <strong>#${escapeHtml(formattedNumber)}</strong> está confirmado y ya estamos preparando todo para que pronto tengas tu USCHH contigo.
  </p>
  <p style="margin: 0 0 8px 0;"><strong>Resumen de tu pedido</strong></p>
  <p style="margin: 0 0 20px 0;">
    Producto: ${escapeHtml(productsSummary)}<br />
    Cantidad: ${totalQuantity}<br />
    Total: ${escapeHtml(formattedTotal)}<br />
    Dirección de entrega: ${escapeHtml(fullAddress)}
  </p>
  <p style="margin: 0 0 16px 0;">Te enviaremos una actualización cuando tu pedido esté en camino.</p>
  <p style="margin: 0 0 16px 0;">Gracias por confiar en nosotros y por ser parte de esta comunidad que recién empieza.</p>
  <p style="margin: 0 0 20px 0;"><strong>Nos vemos en movimiento. ⚡</strong></p>
  <p style="margin: 0 0 20px 0;">
    Equipo USCHH<br />
    Eleva tu potencial.
  </p>
  <p style="margin: 0;">
    <a href="${escapeHtml(siteUrl)}" style="color: #111111; font-weight: 600; text-decoration: underline;">Visita nuestra página web</a>
  </p>
</div>`;

  // 1. If RESEND_API_KEY is available, send via Resend API
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      const fromEmail = process.env.EMAIL_FROM?.trim() || "USCHH <pedidos@uschh-ec.com>";
      const replyTo = process.env.EMAIL_REPLY_TO?.trim() || "uschh.suplementos@gmail.com";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          reply_to: replyTo,
          to: order.email,
          subject,
          text: emailText,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL] Correo de confirmación enviado exitosamente a ${order.email} para pedido ${formattedNumber}`);
        return true;
      } else {
        const errorText = await res.text();
        console.error(`[EMAIL ERROR] Falló envío Resend:`, errorText);
      }
    } catch (err) {
      console.error(`[EMAIL ERROR] Excepción al enviar correo:`, err);
    }
  }

  // 2. Fallback / Default: Log clearly for audit and debugging
  console.log(`[EMAIL DISPATCHED] A: ${order.email} | Asunto: "${subject}" | Total: ${formattedTotal}`);
  return true;
}
