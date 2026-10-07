"use client";
import Image from "next/image";
import Link from "next/link";
import { cartSummary, cents, displayMoney, findProduct, maxQuantity } from "@/lib/cart/cart";
import { useCart } from "./CartProvider";
import styles from "./cart.module.css";

export function CartContents({drawer=false}: {drawer?: boolean}) {
  const cart=useCart();const summary=cartSummary(cart.items,cart.products);
  if(!cart.ready) return <p role="status">CARGANDO CARRITO…</p>;
  if(!cart.items.length) return <div className={styles.empty}><h2>TU CARRITO ESTÁ VACÍO</h2><Link className={styles.action} href="/productos" onClick={cart.closeCart}>EXPLORAR PRODUCTOS ↗</Link></div>;
  return <>
    <p className={styles.notice} role="status">{cart.refreshing ? "VERIFICANDO DISPONIBILIDAD…" : cart.message}</p>
    {!cart.verified && !cart.refreshing && <button className={styles.action} onClick={()=>void cart.refresh()}>VOLVER A VERIFICAR</button>}
    <ul className={styles.items}>{cart.items.map(item=>{
      const product=cart.verified ? findProduct(item,cart.products) : undefined;
      const available=!!product?.purchasable;
      const otherUnits=cart.items.reduce((n,line)=>n+(line.id!==item.id && findProduct(line,cart.products)?.flavor===product?.flavor ? line.quantity : 0),0);
      const maximum=product ? Math.min(maxQuantity(product),5-otherUnits) : 0;
      const label=product?.flavor ?? item.slug;
      return <li key={item.id} className={styles.item}>
        {product && <Image src={product.image} alt={product.name} width={90} height={110} className={styles.image}/>}
        <div className={styles.itemInfo}><h2>{product?.name ?? "PRODUCTO NO DISPONIBLE"}</h2><p className={styles.meta}>{label}</p>
          {product && <p>{product.price} / UNIDAD</p>}
          {!available && <p className={styles.notice}>{product?.availability ?? (cart.refreshing ? "VERIFICANDO…" : "NO DISPONIBLE")}</p>}
          <div className={styles.quantity}><button disabled={!available || cart.refreshing || item.quantity<=1} aria-label={`Reducir cantidad de ${label}`} onClick={()=>cart.change(item.id,item.quantity-1)}>−</button><span aria-label={`Cantidad de ${label}`}>{item.quantity}</span><button disabled={!available || cart.refreshing || item.quantity>=maximum} aria-label={`Aumentar cantidad de ${label}`} onClick={()=>cart.change(item.id,item.quantity+1)}>+</button></div>
          {available && <p className={styles.lineTotal}>{displayMoney(cents(product!.unitPrice)*item.quantity)}</p>}
          <button className={styles.remove} aria-label={`Eliminar ${label} del carrito`} onClick={()=>cart.remove(item.id)}>ELIMINAR</button>
        </div>
      </li>;
    })}</ul>
    <div className={styles.totals}>
      <p><span>SUBTOTAL DE PRODUCTOS</span><strong>{cart.verified && summary.valid ? displayMoney(summary.subtotal!) : "—"}</strong></p>
      {cart.verified && summary.valid ? <><p className={styles.shipping}>{summary.shipping}</p><p><span>TOTAL DE PRODUCTOS A PAGAR</span><strong>{displayMoney(summary.subtotal!)}</strong></p>{summary.subtotal!<3000 && <small>El envío se paga al recibir. Su importe no está incluido.</small>}</> : <p className={styles.notice}>Revisa o elimina los productos no disponibles para continuar.</p>}
      {cart.verified && !cart.refreshing && summary.valid ? <Link className={styles.checkout} href="/checkout" onClick={cart.closeCart}>CONTINUAR AL CHECKOUT ↗</Link> : <button className={styles.checkout} disabled>CONTINUAR AL CHECKOUT</button>}
      {drawer && <Link className={styles.action} href="/carrito" onClick={cart.closeCart}>VER CARRITO COMPLETO ↗</Link>}
      <small>Disponibilidad y precios sujetos a verificación al comprar.</small>
    </div>
  </>;
}
