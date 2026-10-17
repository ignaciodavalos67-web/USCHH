"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ATTEMPT_KEY, CONSENT_TEXT, DELIVERY_AREAS } from "@/lib/checkout/config";
import { validateCheckout } from "@/lib/checkout/validation";
import { cartSummary, cents, displayMoney, findProduct } from "@/lib/cart/cart";
import type { BankDetails } from "@/server/commerce/bank";
import styles from "./checkout.module.css";

function loadPayphoneSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();

    if (!document.querySelector('link[href*="payphone-payment-box.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css";
      document.head.appendChild(link);
    }

    if ((window as unknown as { PPaymentButtonBox?: unknown }).PPaymentButtonBox) {
      return resolve();
    }

    const existing = document.querySelector('script[src*="payphone-payment-box.js"]');
    if (existing) {
      let count = 0;
      const poll = setInterval(() => {
        count++;
        if ((window as unknown as { PPaymentButtonBox?: unknown }).PPaymentButtonBox || count > 40) {
          clearInterval(poll);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js";
    script.onload = () => {
      let count = 0;
      const poll = setInterval(() => {
        count++;
        if ((window as unknown as { PPaymentButtonBox?: unknown }).PPaymentButtonBox || count > 40) {
          clearInterval(poll);
          resolve();
        }
      }, 50);
    };
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPhone."));
    document.head.appendChild(script);
  });
}

export function CheckoutForm() {
  const cart = useCart(),
    router = useRouter();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [payphoneAvailable, setPayphoneAvailable] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<"BANK_TRANSFER" | "PAYPHONE">("BANK_TRANSFER");

  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [ppPreparing, setPpPreparing] = useState(false);
  const [ppReady, setPpReady] = useState(false);
  const [ppError, setPpError] = useState("");

  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const refresh = cart.refresh;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/checkout/session", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (cancelled) return;
        setConfigured(data.bankTransferAvailable);
        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
        }
        if (data.payphoneAvailable) {
          setPayphoneAvailable(true);
        }
        const attempt = sessionStorage.getItem(ATTEMPT_KEY);
        if (attempt) {
          const recovery = await fetch(`/api/checkout/orders?attempt=${encodeURIComponent(attempt)}`, {
            cache: "no-store",
          });
          if (!recovery.ok) throw new Error();
          const existing = await recovery.json();
          if (existing.url) {
            router.replace(existing.url);
            return;
          }
        }
        await refresh();
      } catch {
        if (!cancelled) {
          setConfigured(false);
          setError("No podemos preparar el checkout ahora. Vuelve a intentarlo.");
        }
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refresh, router]);

  const summary = cartSummary(cart.items, cart.products);
  const valid = cart.ready && cart.verified && !cart.refreshing && cart.items.length > 0 && summary.valid;

  function copyAccountNumber() {
    const numberToCopy = bankDetails?.number || "27059145124";
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(numberToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  }

  async function initializePayphone() {
    if (ppPreparing || !valid || !formRef.current) return;
    const form = new FormData(formRef.current);
    const customer = Object.fromEntries(
      ["firstName", "lastName", "idNumber", "email", "phone", "province", "area", "address", "deliveryInstructions"].map(
        (key) => [key, form.get(key)]
      )
    ) as Record<string, string>;

    if (
      !customer.firstName?.trim() ||
      !customer.lastName?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.area?.trim() ||
      !customer.address?.trim()
    ) {
      setPpError("Completa todos los datos de entrega requeridos antes de habilitar el pago con tarjeta.");
      return;
    }

    setPpPreparing(true);
    setPpError("");

    try {
      const payload = {
        customer,
        items: cart.items,
        paymentMethod: "CARD",
        marketingConsent: form.get("marketingConsent") === "on",
      };

      const res = await fetch("/api/checkout/payphone/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const config = await res.json();
      if (!res.ok) {
        setPpError(config.error || "No se pudo preparar la transacción con PayPhone.");
        return;
      }

      await loadPayphoneSdk();
      setPpReady(true);

      setTimeout(() => {
        try {
          const PPBox = (window as unknown as { PPaymentButtonBox?: new (c: unknown) => { render: (id: string) => void } })
            .PPaymentButtonBox;
          if (PPBox) {
            new PPBox(config).render("pp-button");
          } else {
            setPpError("El SDK de PayPhone no respondió. Por favor reintenta.");
          }
        } catch (e: unknown) {
          setPpError(e instanceof Error ? e.message : "Error al mostrar el botón de PayPhone.");
        }
      }, 100);
    } catch {
      setPpError("Error de conexión al preparar el pago con tarjeta.");
    } finally {
      setPpPreparing(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedMethod === "PAYPHONE") {
      void initializePayphone();
      return;
    }

    if (busy.current || !valid || !configured) return;
    const form = new FormData(event.currentTarget);
    const value = {
      customer: Object.fromEntries(
        ["firstName", "lastName", "idNumber", "email", "phone", "province", "area", "address", "deliveryInstructions"].map(
          (key) => [key, form.get(key)]
        )
      ),
      items: cart.items,
      paymentMethod: "BANK_TRANSFER",
      customerTransferred: true,
      marketingConsent: form.get("marketingConsent") === "on",
    };

    try {
      validateCheckout(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revisa los datos obligatorios.");
      return;
    }

    busy.current = true;
    setPending(true);
    setError("");

    try {
      let attempt = sessionStorage.getItem(ATTEMPT_KEY);
      if (!attempt) {
        attempt = crypto.randomUUID();
        sessionStorage.setItem(ATTEMPT_KEY, attempt);
      }
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": attempt },
        body: JSON.stringify(value),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "No se pudo registrar la solicitud.");
        void refresh();
        return;
      }
      router.push(result.url);
    } catch {
      setError("No pudimos confirmar la respuesta. Reintenta para recuperar el mismo pedido sin duplicarlo.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className={styles.grid}>
      <form ref={formRef} onSubmit={submit} className={styles.form}>
        <h2>DATOS DE ENTREGA</h2>
        <p className={styles.note}>Entregas en Quito, Cumbayá, Tumbaco, Puembo y Los Chillos.</p>
        <div className={styles.fields}>
          <label>
            Nombre
            <input
              name="firstName"
              autoComplete="given-name"
              required
              maxLength={80}
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label>
            Apellido
            <input
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={80}
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label className={styles.full}>
            Cédula, RUC o Pasaporte (opcional, para facturación)
            <input
              name="idNumber"
              autoComplete="off"
              maxLength={30}
              placeholder="Ej. 1712345678"
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label>
            Teléfono
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={30}
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label>
            Provincia
            <select name="province" autoComplete="address-level1" required>
              <option value="Pichincha">Pichincha</option>
            </select>
          </label>
          <label>
            Ciudad / Sector
            <select
              name="area"
              required
              defaultValue=""
              onChange={() => ppReady && setPpReady(false)}
            >
              <option value="" disabled>
                Selecciona tu zona
              </option>
              {DELIVERY_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.full}>
            Dirección completa
            <input
              name="address"
              autoComplete="street-address"
              required
              maxLength={500}
              onChange={() => ppReady && setPpReady(false)}
            />
          </label>
          <label className={styles.full}>
            Instrucciones adicionales de entrega (opcional)
            <textarea name="deliveryInstructions" maxLength={500} rows={3} />
          </label>
        </div>

        <fieldset className={styles.payment}>
          <legend>MÉTODO DE PAGO</legend>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={selectedMethod === "BANK_TRANSFER"}
              onChange={() => {
                setSelectedMethod("BANK_TRANSFER");
                setError("");
              }}
              disabled={!configured}
            />
            TRANSFERENCIA BANCARIA
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="PAYPHONE"
              checked={selectedMethod === "PAYPHONE"}
              onChange={() => {
                setSelectedMethod("PAYPHONE");
                setPpReady(false);
                setPpError("");
                setError("");
              }}
              disabled={!payphoneAvailable}
            />
            {payphoneAvailable
              ? "PAGAR CON TARJETA — PAYPHONE"
              : "PAGAR CON TARJETA — PRÓXIMAMENTE"}
          </label>
        </fieldset>

        {selectedMethod === "BANK_TRANSFER" && configured === false && (
          <p className={styles.notice}>
            La transferencia bancaria todavía no está disponible. No se creará ningún pedido.
          </p>
        )}

        {selectedMethod === "BANK_TRANSFER" && configured && (
          <div className={styles.bankCard}>
            <div className={styles.bankHeader}>
              <h3>DATOS DE LA CUENTA USCHH</h3>
              <span className={styles.bankBadge}>ECUADOR</span>
            </div>
            <dl className={styles.bankGrid}>
              <div className={styles.bankItem}>
                <dt>Beneficiario</dt>
                <dd>{bankDetails?.holder || "USCHH"}</dd>
              </div>
              <div className={styles.bankItem}>
                <dt>Banco</dt>
                <dd>{bankDetails?.name || "Produbanco"}</dd>
              </div>
              <div className={styles.bankItem}>
                <dt>Tipo de cuenta</dt>
                <dd>{bankDetails?.type || "Cuenta corriente"}</dd>
              </div>
              <div className={styles.bankItem}>
                <dt>RUC</dt>
                <dd>{bankDetails?.idNumber || "1793231533001"}</dd>
              </div>
              <div className={styles.bankAccountRow}>
                <div>
                  <dt style={{ fontSize: "11px", textTransform: "uppercase", opacity: 0.7, marginBottom: "4px" }}>
                    Número de cuenta
                  </dt>
                  <dd className={styles.accountNumber}>{bankDetails?.number || "27059145124"}</dd>
                </div>
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className={styles.copyBtn}
                  aria-label="Copiar número de cuenta bancaria"
                >
                  {copied ? "✓ ¡COPIADO!" : "COPIAR CUENTA"}
                </button>
              </div>
              <div className={styles.bankItem}>
                <dt>Moneda</dt>
                <dd>{bankDetails?.currency || "USD ($)"}</dd>
              </div>
            </dl>

            <div className={styles.bankTotalBanner}>
              <span>IMPORTE TOTAL EXACTO A TRANSFERIR:</span>
              <strong>{valid ? displayMoney(summary.subtotal!) : "—"}</strong>
            </div>

            {valid && (
              <p className={styles.bankShippingNote}>
                ✓ Envío gratuito incluido en tu pedido.
              </p>
            )}
          </div>
        )}

        {selectedMethod === "PAYPHONE" && (
          <div className={styles.payphoneCard}>
            <div className={styles.payphoneHeader}>
              <h3>PAGAR CON TARJETA — PAYPHONE</h3>
              <span className={styles.payphoneBrands}>Visa · Mastercard · Diners · Discover</span>
            </div>
            <p className={styles.note} style={{ marginBottom: "16px" }}>
              Pago 100% seguro a través de la pasarela oficial PayPhone. Aceptamos tarjetas de débito y crédito nacionales e internacionales.
            </p>

            <div className={styles.bankTotalBanner} style={{ marginTop: 0, marginBottom: "16px" }}>
              <span>TOTAL A COBRAR CON TARJETA:</span>
              <strong>{valid ? displayMoney(summary.subtotal!) : "—"}</strong>
            </div>

            {valid && (
              <p className={styles.bankShippingNote} style={{ marginBottom: "16px" }}>
                ✓ Envío gratuito incluido en tu pedido.
              </p>
            )}

            {ppError && (
              <p role="alert" className={styles.notice} style={{ color: "#FF453A" }}>
                {ppError}
              </p>
            )}

            {!ppReady ? (
              <button
                type="button"
                onClick={initializePayphone}
                className={styles.payphoneInitBtn}
                disabled={!valid || ppPreparing}
              >
                {ppPreparing ? "PREPARANDO PASARELA SEGURA…" : "HABILITAR PAGO CON TARJETA"}
              </button>
            ) : (
              <div>
                <p className={styles.note} style={{ marginBottom: "12px", textAlign: "center" }}>
                  Haz clic en el botón de PayPhone para ingresar los datos de tu tarjeta de forma segura:
                </p>
                <div className={styles.payphoneBoxContainer}>
                  <div id="pp-button" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPpReady(false);
                    void initializePayphone();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand-yellow)",
                    fontSize: "11px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    display: "block",
                    margin: "12px auto 0",
                  }}
                >
                  ↻ ¿Cambiaste tus datos? Recargar pasarela
                </button>
              </div>
            )}
          </div>
        )}

        <label className={styles.consent}>
          <input type="checkbox" name="marketingConsent" />
          {CONSENT_TEXT}
        </label>

        {error && (
          <p role="alert" className={styles.notice}>
            {error}
          </p>
        )}

        {!valid && cart.ready && (
          <p className={styles.notice}>
            {cart.refreshing
              ? "Verificando disponibilidad…"
              : "Revisa el carrito: hay productos no disponibles o está vacío."}{" "}
            <Link href="/carrito">VOLVER AL CARRITO</Link>
          </p>
        )}

        {selectedMethod === "BANK_TRANSFER" && (
          <>
            <button
              type="submit"
              className={`${styles.primary} ${styles.transferSubmitBtn}`}
              disabled={!valid || !configured || pending}
            >
              {pending ? "REGISTRANDO SOLICITUD…" : "¡TRANSFERENCIA YA HECHA!"}
            </button>

            <p className={styles.note}>
              Al pulsar este botón registraremos tu solicitud con estado pendiente de confirmación. Tu pedido será procesado una vez que verifiquemos la recepción del pago en nuestra cuenta.
            </p>
          </>
        )}
      </form>

      <aside className={styles.summary} aria-label="Resumen del pedido">
        <h2>TU PEDIDO</h2>
        {cart.items.map((item) => {
          const product = cart.verified ? findProduct(item, cart.products) : undefined;
          return (
            <div className={styles.line} key={item.id}>
              <p>
                {item.quantity} × {product?.name ?? item.slug}
              </p>
              {product && (
                <>
                  <small>{product.price} / UNIDAD</small>
                  <strong>{displayMoney(cents(product.unitPrice) * item.quantity)}</strong>
                  {!product.purchasable && <p className={styles.notice}>{product.availability}</p>}
                </>
              )}
            </div>
          );
        })}
        {valid ? (
          <>
            <p className={styles.total}>
              <span>SUBTOTAL</span>
              <strong>{displayMoney(summary.subtotal!)}</strong>
            </p>
            <p>{summary.shipping}</p>
            <p className={styles.total}>
              <span>TOTAL A COBRAR</span>
              <strong>{displayMoney(summary.subtotal!)}</strong>
            </p>
            <p className={styles.note}>
              ✓ Envío gratuito incluido en tu compra.
            </p>
          </>
        ) : (
          <p className={styles.notice}>Sin total válido hasta verificar los productos.</p>
        )}
      </aside>
    </div>
  );
}
