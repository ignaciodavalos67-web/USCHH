"use client";
import { useState } from "react";
import type { CartProduct } from "@/lib/cart/cart";
import { maxQuantity } from "@/lib/cart/cart";
import { useCart } from "./CartProvider";
import styles from "./cart.module.css";
export function AddToCart({product}: {product: CartProduct}) {
  const cart=useCart();const [quantity,setQuantity]=useState(1);const [pending,setPending]=useState(false);const [feedback,setFeedback]=useState("");
  const maximum=maxQuantity(product);
  async function add(){setPending(true);const success=await cart.add(product,quantity);setFeedback(success ? "Añadido al carrito." : "No se pudo añadir. Revisa la disponibilidad o el límite de 5 por sabor.");setPending(false);}
  return <div className={styles.add}>
    {product.purchasable && <label className={styles.select}>CANTIDAD<select aria-label={`Cantidad de ${product.flavor}`} value={quantity} onChange={event=>setQuantity(Number(event.target.value))}>{Array.from({length:maximum},(_,index)=><option key={index+1} value={index+1}>{index+1}</option>)}</select></label>}
    <button className={styles.action} disabled={!product.purchasable || !cart.ready || pending} onClick={()=>void add()}>{!product.purchasable ? product.availability : pending ? "VERIFICANDO…" : "AÑADIR AL CARRITO ↗"}</button>
    <p className={styles.notice} role="status">{feedback}</p>
  </div>;
}
