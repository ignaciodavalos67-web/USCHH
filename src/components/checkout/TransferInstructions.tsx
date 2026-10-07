"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ATTEMPT_KEY } from "@/lib/checkout/config";
import type { publicOrder } from "@/server/commerce/orders";
import styles from "./checkout.module.css";
type Order = ReturnType<typeof publicOrder>;
export function TransferInstructions({order}: {order: Order}) {
  const cart=useCart();const clear=cart.clearPurchased;
  const [marked,setMarked]=useState(!!order.customerMarkedTransferredAt), [pending,setPending]=useState(false), [error,setError]=useState("");
  const [expired,setExpired]=useState(!!order.expiresAt && new Date(order.expiresAt)<=new Date());
  useEffect(()=>{if(!order.expiresAt)return;const timer=setTimeout(()=>setExpired(true),Math.max(0,new Date(order.expiresAt).getTime()-Date.now()));return()=>clearTimeout(timer);},[order.expiresAt]);
  useEffect(()=>{if(!cart.ready)return;clear(order.accessId,order.items);try{sessionStorage.removeItem(ATTEMPT_KEY);}catch{}},[cart.ready,clear,order.accessId,order.items]);
  async function mark(){if(pending)return;setPending(true);try{const response=await fetch("/api/checkout/transfer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessId:order.accessId})});const result=await response.json();if(!response.ok){setError(result.error);return;}setMarked(true);}catch{setError("No pudimos registrar tu aviso. Puedes volver a intentarlo.");}finally{setPending(false);}}
  return <section className={styles.transfer}>
    <p className={styles.note}>REFERENCIA DE TU PEDIDO</p><h1>{order.number}</h1>
    {order.status==="CANCELLED" ? <h2>PEDIDO CANCELADO</h2> : order.status==="PAID" ? <h2>PAGO CONFIRMADO</h2> : expired ? <><h2>RESERVA VENCIDA</h2><p>No realices la transferencia. Contacta con USCHH para revisar disponibilidad.</p></> : marked ? <><h2>TRANSFERENCIA PENDIENTE DE CONFIRMACIÓN</h2><p>Hemos registrado que realizaste la transferencia. Verificaremos el pago y te enviaremos una confirmación cuando sea aprobado.</p></> : <>
      <h2>TRANSFERENCIA BANCARIA</h2><p className={styles.total}><span>TOTAL A TRANSFERIR</span><strong>{order.total}</strong></p>
      <p>{order.shippingMode==="FREE" ? "ENVÍO GRATIS" : "ENVÍO PAGADO AL RECIBIR. El coste del envío no está incluido."}</p>
      {order.bank ? <dl className={styles.bank}><dt>Banco</dt><dd>{order.bank.name}</dd><dt>Titular</dt><dd>{order.bank.holder}</dd><dt>Tipo de cuenta</dt><dd>{order.bank.type}</dd><dt>Número de cuenta</dt><dd>{order.bank.number}</dd>{order.bank.idNumber && <><dt>Identificación del titular</dt><dd>{order.bank.idNumber}</dd></>}</dl> : <p className={styles.notice}>Datos bancarios no disponibles. No realices una transferencia.</p>}
      <p>Utiliza <strong>{order.number}</strong> como referencia cuando sea posible.</p>
      {order.expiresAt && <p className={styles.note}>Reserva válida hasta: <time dateTime={order.expiresAt}>{new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"medium",timeStyle:"short"}).format(new Date(order.expiresAt))} (hora de Ecuador)</time>.</p>}
      <button className={styles.primary} disabled={pending || !order.bank} onClick={()=>void mark()}>{pending ? "REGISTRANDO…" : "YA REALICÉ LA TRANSFERENCIA"}</button><p className={styles.note}>Este aviso no confirma el pago. USCHH verificará la transferencia.</p>
    </>}
    <p role="alert" className={styles.notice}>{error}</p>
  </section>;
}
