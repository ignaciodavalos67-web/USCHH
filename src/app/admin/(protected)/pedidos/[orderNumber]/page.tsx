import { notFound } from "next/navigation";
import { adminService, requireAdminPage } from "@/server/admin/context";
import { AdminError } from "@/server/admin/errors";
import { AdminForm } from "@/components/admin/AdminForms";
import { date, money, status } from "@/components/admin/AdminDisplay";
import { formatOrderNumber } from "@/server/commerce/policies";
import styles from "@/components/admin/admin.module.css";

export default async function Detail({ params }: { params: Promise<{ orderNumber: string }> }) {
  await requireAdminPage();
  const { orderNumber } = await params;
  let order;
  try {
    order = await adminService.detail(orderNumber);
  } catch (error) {
    if (error instanceof AdminError && error.status === 404) notFound();
    throw error;
  }

  const next: Record<string, string> = { PAID: "PREPARING", PREPARING: "SHIPPED", SHIPPED: "DELIVERED" };
  const expired = !!order.reservationExpiresAt && order.reservationExpiresAt <= new Date();
  const isException = order.fulfillmentStatus === "EXCEPTION_INSUFFICIENT_STOCK";

  return (
    <>
      <h1>{formatOrderNumber(order.number)}</h1>
      <p>
        {date(order.createdAt)} · {status(order.status)} · {status(order.fulfillmentStatus)}
      </p>

      {isException && (
        <div style={{ background: "#FF453A22", border: "1px solid #FF453A", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
          <h2 style={{ color: "#FF453A", margin: "0 0 8px 0" }}>⚠️ EXCEPCIÓN DE INVENTARIO / SOBREVENTA DETECTADA</h2>
          <p style={{ margin: 0 }}>
            El pago fue aprobado por PayPhone, pero el stock disponible era insuficiente al momento de la confirmación.
            <strong> NO marcar como enviado.</strong> Resuelve la reposición de inventario físico o procesa un reembolso manual al cliente desde la consola de PayPhone.
          </p>
        </div>
      )}

      <div className={styles.detailGrid}>
        <section className={styles.section}>
          <h2>CLIENTE</h2>
          <p>{order.firstName} {order.lastName}</p>
          <p>Cédula / RUC: <strong>{order.idNumber || "Consumidor final (no especificado)"}</strong></p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
        </section>

        <section className={styles.section}>
          <h2>ENTREGA</h2>
          <p>{order.province} · {order.city}</p>
          <p>{order.address}</p>
          <h3>INSTRUCCIONES DEL CLIENTE</h3>
          <p className={styles.pre}>{order.deliveryInstructions || "Sin instrucciones."}</p>
        </section>

        <section className={styles.section}>
          <h2>PRODUCTOS</h2>
          {order.items.map((item) => (
            <div className={styles.line} key={item.id}>
              <strong>{item.productName} · {item.flavor}</strong>
              <p>{item.quantity} × {money(item.unitPrice)} = {money(item.lineTotal)}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>IMPORTES HISTÓRICOS</h2>
          <p>Subtotal: {money(order.subtotal)}</p>
          {order.payphoneAttempt?.taxableBase && (
            <p>Base imponible (IVA 15%): {money(order.payphoneAttempt.taxableBase)}</p>
          )}
          {order.payphoneAttempt?.productVat && (
            <p>IVA 15% productos: {money(order.payphoneAttempt.productVat)}</p>
          )}
          <p>
            Envío: {status(order.shippingMode)} ·{" "}
            {order.shippingAmount === null ? "Importe desconocido, pagado al recibir" : money(order.shippingAmount)}
          </p>
          <p>
            Total: <strong>{money(order.total)}</strong>
          </p>
        </section>

        <section className={styles.section}>
          <h2>PAGO</h2>
          {order.payments.map((payment) => (
            <div key={payment.id} style={{ marginBottom: "16px" }}>
              <p>
                <strong>{status(payment.method)}</strong> · {status(payment.status)}
              </p>
              {payment.customerMarkedTransferredAt && (
                <p>Aviso del cliente: {date(payment.customerMarkedTransferredAt)}</p>
              )}
              {payment.paidAt && <p>Pago recibido: {date(payment.paidAt)}</p>}
              {payment.provider && (
                <p>Pasarela: <strong>{payment.provider}</strong></p>
              )}
              {payment.providerReference && (
                <p>ID Transacción PayPhone: <code>{payment.providerReference}</code></p>
              )}
              {order.payphoneAttempt?.authorizationCode && (
                <p>Código autorización: <code>{order.payphoneAttempt.authorizationCode}</code></p>
              )}
              {order.payphoneAttempt?.cardBrand && (
                <p>
                  Tarjeta: {order.payphoneAttempt.cardBrand}{" "}
                  {order.payphoneAttempt.lastDigits ? `(**** ${order.payphoneAttempt.lastDigits})` : ""}
                </p>
              )}
            </div>
          ))}

          {order.payphoneAttempt && (
            <div style={{ background: "#FFFFFF0A", padding: "12px", borderRadius: "6px", marginTop: "12px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>LIQUIDACIÓN FINANCIERA (SOLO ADMIN)</h3>
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Comisión PayPhone est. (5.75%): {money(order.payphoneAttempt.estimatedCommission)}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                IVA sobre comisión est. (15%): {money(order.payphoneAttempt.estimatedCommissionVat)}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Liquidación neta estimada: <strong>{money(order.payphoneAttempt.estimatedSettlement)}</strong>
              </p>
              <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
                * La comisión es gasto del negocio (no se añade al cliente). El IVA sobre la comisión puede ser crédito tributario según régimen SRI.
              </small>
            </div>
          )}

          <p style={{ marginTop: "12px" }}>
            Reserva: {order.reservationStatus} {order.reservationExpiresAt ? `· vence ${date(order.reservationExpiresAt)}` : ""}
          </p>

          {order.status === "PENDING_PAYMENT" && order.reservationStatus === "RESERVED" && !expired && (
            <AdminForm
              action="confirm"
              label="CONFIRMAR PAGO RECIBIDO"
              confirmMessage={`¿Has comprobado que recibiste ${money(order.total)} para ${formatOrderNumber(order.number)}? El aviso del cliente no confirma el pago.`}
            >
              <input type="hidden" name="id" value={order.id} />
            </AdminForm>
          )}

          {expired && order.reservationStatus === "RESERVED" && (
            <p className={styles.notice}>
              RESERVA VENCIDA. Revisa antes de aceptar una transferencia tardía; este flujo no la confirma automáticamente.
            </p>
          )}

          {order.status === "PENDING_PAYMENT" && order.reservationStatus === "RESERVED" && (
            <AdminForm
              action="cancel"
              label="CANCELAR PEDIDO Y LIBERAR RESERVA"
              confirmMessage="¿Cancelar este pedido impagado y liberar sus unidades reservadas? No es un reembolso."
            >
              <input type="hidden" name="id" value={order.id} />
              <label>
                Motivo
                <input name="reason" required maxLength={500} />
              </label>
            </AdminForm>
          )}

          {["PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(order.status) && (
            <p className={styles.help}>
              La devolución de pedidos pagados requiere un flujo de reembolso manual en PayPhone o transferencia bancaria.
            </p>
          )}
        </section>

        <section className={styles.section}>
          <h2>PREPARACIÓN Y ENVÍO</h2>
          <p>Estado de entrega: <strong>{status(order.fulfillmentStatus)}</strong></p>
          <p>Transportista: {order.carrier || "—"}</p>
          <p>Seguimiento: {order.trackingNumber || "—"}</p>
          <p>Enviado: {date(order.shippedAt)}</p>
          <p>Entregado: {date(order.deliveredAt)}</p>

          {!isException && next[order.status] && (
            <AdminForm
              action="transition"
              label={`MARCAR ${status(next[order.status])}`}
              confirmMessage={`¿Cambiar a ${status(next[order.status])}?`}
            >
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={next[order.status]} />
              {order.status === "PREPARING" && (
                <>
                  <label>
                    Transportista
                    <input name="carrier" required maxLength={100} />
                  </label>
                  <label>
                    Número de seguimiento
                    <input name="trackingNumber" required maxLength={100} />
                  </label>
                </>
              )}
            </AdminForm>
          )}
        </section>
      </div>

      <section className={styles.section}>
        <h2>NOTAS INTERNAS · SOLO ADMIN</h2>
        <AdminForm action="note" label="AÑADIR NOTA PRIVADA">
          <input type="hidden" name="id" value={order.id} />
          <label>
            Nota
            <textarea name="content" required maxLength={2000} rows={3} />
          </label>
        </AdminForm>
        {order.notes.map((note) => (
          <article className={styles.line} key={note.id}>
            <p className={styles.pre}>{note.content}</p>
            <small>
              {note.author?.name ?? note.author?.email ?? "Sistema"} · {date(note.createdAt)}
            </small>
          </article>
        ))}
        <p className={styles.help}>
          Se muestran las últimas {order.notes.length} de {order._count.notes} notas; no se editan ni se incluyen en exportaciones.
        </p>
      </section>

      <section className={styles.section}>
        <h2>HISTORIAL DE INVENTARIO</h2>
        {order.items.flatMap((item) =>
          item.inventoryMovements.map((movement) => (
            <p key={movement.id}>
              {date(movement.createdAt)} · {item.flavor} · {movement.type} · Δ {movement.delta} · stock disponible {movement.stockAfter}
            </p>
          ))
        )}
      </section>
    </>
  );
}
