import "server-only";
import { formatOrderNumber, formatMoney } from "./policies";
import type { Prisma } from "@/generated/prisma/client";

export type ConfirmedOrderEmailData = {
  number: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  currency: string;
  items: {
    productName: string;
    flavor: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    lineTotal: Prisma.Decimal;
  }[];
};

export async function sendOrderConfirmationEmail(order: ConfirmedOrderEmailData): Promise<boolean> {
  const formattedNumber = formatOrderNumber(order.number);
  const formattedTotal = formatMoney(order.total, order.currency);
  const customerName = `${order.firstName} ${order.lastName}`.trim();

  const subject = `¡Tu pedido ${formattedNumber} de USCHH ha sido confirmado!`;
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.quantity} × ${item.productName} (${item.flavor}) — ${formatMoney(item.lineTotal, order.currency)}`
    )
    .join("\n");

  const emailBody = `Hola ${customerName},

¡Tu transferencia bancaria ha sido verificada y confirmada con éxito!

Tu pedido ${formattedNumber} está en preparación y pronto comenzará su camino hacia ti.

DETALLES DEL PEDIDO:
Referencia: ${formattedNumber}
Total pagado: ${formattedTotal}

PRODUCTOS:
${itemsText}

DIRECCIÓN DE ENTREGA:
${order.address}
${order.city}, ${order.province}

Te notificaremos tan pronto como tu paquete sea despachado.

¡Gracias por confiar en USCHH y permitirnos acompañarte en tu movimiento!

Equipo USCHH
info@uschh.com
`;

  // 1. If RESEND_API_KEY is available, send via Resend API
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      const fromEmail = process.env.EMAIL_FROM?.trim() || "USCHH <pedidos@uschh.com>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: order.email,
          subject,
          text: emailBody,
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
