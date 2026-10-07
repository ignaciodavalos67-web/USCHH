"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { CartContents } from "./CartContents";
import styles from "./cart.module.css";
export function CartDrawer() {
  const cart=useCart();const dialog=useRef<HTMLDialogElement>(null);const pathname=usePathname();
  const closeCart=cart.closeCart;
  useEffect(()=>{closeCart();},[pathname,closeCart]);
  useEffect(()=>{
    if(!cart.open)return;
    const element=dialog.current;const focus=document.activeElement as HTMLElement | null;
    const rootOverflow=document.documentElement.style.overflow;const bodyOverflow=document.body.style.overflow;
    document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";element?.showModal();
    return()=>{element?.close();document.documentElement.style.overflow=rootOverflow;document.body.style.overflow=bodyOverflow;focus?.focus();};
  },[cart.open]);
  return <dialog ref={dialog} className={styles.drawer} aria-labelledby="cart-title" onKeyDown={event=>{
    if(event.key!=="Tab")return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], select:not(:disabled), [tabindex="0"]'));
    const first=controls[0], last=controls.at(-1);
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
  }} onCancel={event=>{event.preventDefault();cart.closeCart();}} onClick={event=>{if(event.target===dialog.current){const rect=dialog.current.getBoundingClientRect();if(event.clientX<rect.left)cart.closeCart();}}}>
    <header className={styles.drawerHeader}><h2 id="cart-title">CARRITO <span>({cart.count})</span></h2><button autoFocus aria-label="Cerrar carrito" onClick={cart.closeCart}>×</button></header>
    <div className={styles.drawerBody}><CartContents drawer /></div>
  </dialog>;
}
