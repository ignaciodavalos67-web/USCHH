"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ATTEMPT_KEY, CONSENT_TEXT, DELIVERY_AREAS } from "@/lib/checkout/config";
import { validateCheckout } from "@/lib/checkout/validation";
import { cartSummary, cents, displayMoney, findProduct } from "@/lib/cart/cart";
import styles from "./checkout.module.css";

export function CheckoutForm() {
  const cart=useCart(), router=useRouter();
  const [configured,setConfigured]=useState<boolean | null>(null), [pending,setPending]=useState(false), [error,setError]=useState("");
  const busy=useRef(false);const refresh=cart.refresh;
  useEffect(()=>{
    let cancelled=false;
    const controller=new AbortController();
    void (async()=>{
      try {
        const response=await fetch("/api/checkout/session",{cache:"no-store",signal:controller.signal});if(!response.ok)throw new Error();
        const data=await response.json();if(cancelled)return;setConfigured(data.bankTransferAvailable);
        const attempt=sessionStorage.getItem(ATTEMPT_KEY);
        if(attempt){const recovery=await fetch(`/api/checkout/orders?attempt=${encodeURIComponent(attempt)}`,{cache:"no-store"});if(!recovery.ok)throw new Error();const existing=await recovery.json();if(existing.url){router.replace(existing.url);return;}}
        await refresh();
      }catch{if(!cancelled){setConfigured(false);setError("No podemos preparar el checkout ahora. Vuelve a intentarlo.");}}
    })();return()=>{cancelled=true;controller.abort();};
  },[refresh,router]);
  const summary=cartSummary(cart.items,cart.products);
  const valid=cart.ready && cart.verified && !cart.refreshing && cart.items.length>0 && summary.valid;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();if(busy.current || !valid || !configured)return;
    const form=new FormData(event.currentTarget);
    const value={customer:Object.fromEntries(["firstName","lastName","email","phone","province","area","address","deliveryInstructions"].map(key=>[key,form.get(key)])),items:cart.items,paymentMethod:"BANK_TRANSFER",marketingConsent:form.get("marketingConsent")==="on"};
    try{validateCheckout(value);}catch(error){setError(error instanceof Error ? error.message : "Revisa los datos.");return;}
    busy.current=true;setPending(true);setError("");
    try{
      let attempt=sessionStorage.getItem(ATTEMPT_KEY);if(!attempt){attempt=crypto.randomUUID();sessionStorage.setItem(ATTEMPT_KEY,attempt);}
      const response=await fetch("/api/checkout/orders",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":attempt},body:JSON.stringify(value)});
      const result=await response.json();if(!response.ok){setError(result.error ?? "No se pudo crear el pedido.");void refresh();return;}
      router.push(result.url);
    }catch{setError("No pudimos confirmar la respuesta. Reintenta para recuperar el mismo pedido sin duplicarlo.");}
    finally{busy.current=false;setPending(false);}
  }
  return <div className={styles.grid}>
    <form onSubmit={submit} className={styles.form}>
      <h2>DATOS DE ENTREGA</h2><p className={styles.note}>Entregas en Quito, Cumbayá, Tumbaco, Puembo y Los Chillos.</p>
      <div className={styles.fields}>
        <label>Nombre<input name="firstName" autoComplete="given-name" required maxLength={80}/></label>
        <label>Apellido<input name="lastName" autoComplete="family-name" required maxLength={80}/></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
        <label>Teléfono<input name="phone" type="tel" autoComplete="tel" required maxLength={30}/></label>
        <label>Provincia<select name="province" autoComplete="address-level1" required><option value="Pichincha">Pichincha</option></select></label>
        <label>Ciudad / Sector<select name="area" required defaultValue=""><option value="" disabled>Selecciona tu zona</option>{DELIVERY_AREAS.map(area=><option key={area.id} value={area.id}>{area.label}</option>)}</select></label>
        <label className={styles.full}>Dirección<input name="address" autoComplete="street-address" required maxLength={500}/></label>
        <label className={styles.full}>Instrucciones de entrega (opcional)<textarea name="deliveryInstructions" maxLength={500} rows={3}/></label>
      </div>
      <fieldset className={styles.payment}><legend>MÉTODO DE PAGO</legend><label><input type="radio" name="paymentMethod" value="BANK_TRANSFER" defaultChecked disabled={!configured}/> TRANSFERENCIA BANCARIA</label><label><input type="radio" disabled/> TARJETA — PRÓXIMAMENTE</label></fieldset>
      {configured===false && <p className={styles.notice}>La transferencia bancaria todavía no está disponible. No se creará ningún pedido.</p>}
      <label className={styles.consent}><input type="checkbox" name="marketingConsent"/>{CONSENT_TEXT}</label>
      <p role="alert" className={styles.notice}>{error}</p>
      {!valid && cart.ready && <p className={styles.notice}>{cart.refreshing ? "Verificando disponibilidad…" : "Revisa el carrito: hay productos no disponibles o está vacío."} <Link href="/carrito">VOLVER AL CARRITO</Link></p>}
      <button className={styles.primary} disabled={!valid || !configured || pending}>{pending ? "CREANDO PEDIDO…" : "CREAR PEDIDO Y VER DATOS DE TRANSFERENCIA ↗"}</button>
      <p className={styles.note}>El pago queda pendiente de verificación. La reserva dura 24 horas; no transfieras una vez vencida.</p>
    </form>
    <aside className={styles.summary} aria-label="Resumen del pedido"><h2>TU PEDIDO</h2>
      {cart.items.map(item=>{const product=cart.verified ? findProduct(item,cart.products) : undefined;return <div className={styles.line} key={item.id}><p>{item.quantity} × {product?.name ?? item.slug}</p>{product && <><small>{product.price} / UNIDAD</small><strong>{displayMoney(cents(product.unitPrice)*item.quantity)}</strong>{!product.purchasable && <p className={styles.notice}>{product.availability}</p>}</>}</div>;})}
      {valid ? <><p className={styles.total}><span>SUBTOTAL</span><strong>{displayMoney(summary.subtotal!)}</strong></p><p>{summary.shipping}</p><p className={styles.total}><span>TOTAL A TRANSFERIR</span><strong>{displayMoney(summary.subtotal!)}</strong></p>{summary.subtotal!<3000 && <p className={styles.note}>El envío se paga al recibir. Su importe no está incluido en la transferencia.</p>}</> : <p className={styles.notice}>Sin total válido hasta verificar los productos.</p>}
    </aside>
  </div>;
}
