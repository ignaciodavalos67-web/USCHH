"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ATTEMPT_KEY } from "@/lib/checkout/config";
import type { publicOrder } from "@/server/commerce/orders";
import styles from "./checkout.module.css";

type Order = ReturnType<typeof publicOrder>;

export function TransferInstructions({ order }: { order: Order }) {
  const cart = useCart();
  const clear = cart.clearPurchased;
  const [marked, setMarked] = useState(!!order.customerMarkedTransferredAt);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(!!order.expiresAt && new Date(order.expiresAt) <= new Date());

  useEffect(() => {
    if (!order.expiresAt) return;
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(0, new Date(order.expiresAt).getTime() - Date.now())
    );
    return () => clearTimeout(timer);
  }, [order.expiresAt]);

  useEffect(() => {
    if (!cart.ready) return;
    clear(order.accessId, order.items);
    try {
      sessionStorage.removeItem(ATTEMPT_KEY);
    } catch {}
  }, [cart.ready, clear, order.accessId, order.items]);

  async function copyNumber() {
    if (!order.bank?.number) return;
    try {
      await navigator.clipboard.writeText(order.bank.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function mark() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/checkout/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: order.accessId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error);
        return;
      }
      setMarked(true);
    } catch {
      setError("No pudimos registrar tu aviso. Puedes volver a intentarlo.");
    } finally {
      setPending(false);
    }
  }

  // 1. Pedido Cancelado
  if (order.status === "CANCELLED") {
    return (
      <section className={styles.confirmationContainer}>
        <h1 className={styles.confirmationTitle}>PEDIDO CANCELADO</h1>
        <div className={styles.confirmationMessage}>
          <p>Este pedido o su reserva asociada ha sido cancelado.</p>
        </div>
        <div className={styles.confirmationDetailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Referencia de transferencia</span>
            <span className={styles.detailValue}>{order.number}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Importe total</span>
            <span className={styles.detailValue}>{order.total}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.statusRejected}>Cancelado</span>
          </div>
        </div>
      </section>
    );
  }

  // 2. Pedido Pagado / Confirmado
  if (order.status === "PAID") {
    return (
      <section className={styles.confirmationContainer}>
        <h1 className={styles.confirmationTitle}>¡PAGO CONFIRMADO!</h1>
        <div className={styles.confirmationMessage}>
          {order.paymentMethod === "CARD" ? (
            <p>Tu pago con tarjeta ha sido verificado con éxito a través de PayPhone. Estamos preparando tu pedido para el envío.</p>
          ) : (
            <p>Tu transferencia ha sido verificada con éxito. Estamos preparando tu pedido para el envío.</p>
          )}
          <p>Te hemos enviado la confirmación y los detalles a tu correo electrónico.</p>
        </div>
        <div className={styles.confirmationDetailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {order.paymentMethod === "CARD" ? "Número de pedido" : "Referencia de transferencia"}
            </span>
            <span className={styles.detailValue}>{order.number}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Importe total</span>
            <span className={styles.detailValue}>{order.total}</span>
          </div>
          {order.idNumber && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cédula / RUC (Facturación)</span>
              <span className={styles.detailValue}>{order.idNumber}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Correo electrónico</span>
            <span className={styles.detailValue}>{order.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.statusConfirmed}>Pago confirmado</span>
          </div>
        </div>
      </section>
    );
  }

  // 3. Reserva Vencida
  if (expired && !marked) {
    return (
      <section className={styles.confirmationContainer}>
        <h1 className={styles.confirmationTitle}>RESERVA VENCIDA</h1>
        <div className={styles.confirmationMessage}>
          <p>El tiempo de reserva de inventario (24 horas) para este pedido ha finalizado.</p>
          <p>Por favor, <strong>no realices la transferencia</strong>. Contacta con atención de USCHH para verificar disponibilidad actualizada.</p>
        </div>
        <div className={styles.confirmationDetailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Referencia</span>
            <span className={styles.detailValue}>{order.number}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.statusRejected}>Expirado</span>
          </div>
        </div>
      </section>
    );
  }

  // 4. Transferencia realizada / en proceso de confirmación
  if (marked) {
    return (
      <section className={styles.confirmationContainer}>
        <h1 className={styles.confirmationTitle}>¡Gracias por comprar en USCHH!</h1>
        <div className={styles.confirmationMessage}>
          <p><strong>Tu transferencia está en proceso de confirmación.</strong></p>
          <p>
            Una vez que verifiquemos que el pago ha sido recibido correctamente, tu pedido será confirmado y comenzaremos a prepararlo.
          </p>
          <p>
            Te enviaremos una confirmación al correo electrónico que registraste durante tu compra.
          </p>
          <p style={{ color: "var(--brand-yellow)", fontWeight: 600 }}>
            ¡Gracias por confiar en USCHH y permitirnos acompañarte en tu movimiento!
          </p>
        </div>

        <div className={styles.confirmationDetailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Referencia de transferencia</span>
            <span className={styles.detailValue}>{order.number}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Importe total</span>
            <span className={styles.detailValue}>{order.total}</span>
          </div>
          {order.idNumber && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cédula / RUC (Facturación)</span>
              <span className={styles.detailValue}>{order.idNumber}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Correo electrónico</span>
            <span className={styles.detailValue}>{order.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.statusPending}>Pendiente de confirmación</span>
          </div>
        </div>

        <p style={{ marginTop: "24px", fontSize: "14px", opacity: 0.8, textAlign: "center" }}>
          No necesitas realizar ninguna otra acción por ahora.
        </p>
      </section>
    );
  }

  // 5. En caso de que el cliente aún no haya marcado la transferencia
  return (
    <section className={styles.transfer}>
      <p className={styles.note}>REFERENCIA DE TU PEDIDO</p>
      <h1>{order.number}</h1>

      <h2>TRANSFERENCIA BANCARIA</h2>
      <p className={styles.total}>
        <span>TOTAL A TRANSFERIR</span>
        <strong>{order.total}</strong>
      </p>
      <p>
        {order.shippingMode === "FREE"
          ? "ENVÍO GRATIS"
          : "ENVÍO PAGADO AL RECIBIR. El coste del envío no está incluido."}
      </p>

      {order.bank ? (
        <div className={styles.bankCard}>
          <div className={styles.bankHeader}>
            <span className={styles.bankBadge}>CUENTA OFICIAL USCHH</span>
            <span className={styles.bankSecureTag}>PAGO SEGURO ECUADOR</span>
          </div>
          <div className={styles.bankGrid}>
            <div className={styles.bankField}>
              <span className={styles.bankLabel}>Banco</span>
              <strong className={styles.bankValue}>{order.bank.name}</strong>
            </div>
            <div className={styles.bankField}>
              <span className={styles.bankLabel}>Titular de la cuenta</span>
              <strong className={styles.bankValue}>{order.bank.holder}</strong>
            </div>
            <div className={styles.bankField}>
              <span className={styles.bankLabel}>Tipo de cuenta</span>
              <strong className={styles.bankValue}>{order.bank.type}</strong>
            </div>
            <div className={styles.bankField}>
              <span className={styles.bankLabel}>Número de cuenta</span>
              <div className={styles.bankAccountRow}>
                <strong className={styles.bankAccountNumber}>{order.bank.number}</strong>
                <button
                  type="button"
                  onClick={() => void copyNumber()}
                  className={styles.copyBtn}
                >
                  {copied ? "✓ Copiado" : "Copiar número"}
                </button>
              </div>
            </div>
            {order.bank.idNumber && (
              <div className={styles.bankField}>
                <span className={styles.bankLabel}>RUC / Cédula</span>
                <strong className={styles.bankValue}>{order.bank.idNumber}</strong>
              </div>
            )}
            <div className={styles.bankField}>
              <span className={styles.bankLabel}>Moneda</span>
              <strong className={styles.bankValue}>{order.bank.currency ?? "USD ($)"}</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.notice}>Datos bancarios no disponibles. No realices una transferencia.</p>
      )}

      <p>
        Utiliza <strong>{order.number}</strong> como referencia o concepto de la transferencia.
      </p>

      {order.expiresAt && (
        <p className={styles.note}>
          Reserva válida hasta:{" "}
          <time dateTime={order.expiresAt}>
            {new Intl.DateTimeFormat("es-EC", {
              timeZone: "America/Guayaquil",
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(order.expiresAt))}{" "}
            (hora de Ecuador)
          </time>
          .
        </p>
      )}

      <button
        className={`${styles.primary} ${styles.transferSubmitBtn}`}
        disabled={pending || !order.bank}
        onClick={() => void mark()}
      >
        {pending ? "REGISTRANDO…" : "¡TRANSFERENCIA YA HECHA!"}
      </button>

      {error && <p role="alert" className={styles.notice}>{error}</p>}
    </section>
  );
}
