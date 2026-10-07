"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { addItem, CART_KEY, findProduct, parseCart, reconcile, removeItem, serializeCart, setQuantity, totalUnits, type CartItem, type CartProduct } from "@/lib/cart/cart";
import { CartDrawer } from "./CartDrawer";

type CartContextValue = {
  items: CartItem[]; products: CartProduct[]; ready: boolean; verified: boolean; refreshing: boolean; message: string; count: number;
  open: boolean; openCart: () => void; closeCart: () => void; refresh: () => Promise<CartProduct[] | null>;
  add: (product: CartProduct, quantity: number) => Promise<boolean>; change: (id: string, quantity: number) => void; remove: (id: string) => void;
  clearPurchased: (accessId: string, purchased: {id: string; quantity: number}[]) => void;
};
const CartContext = createContext<CartContextValue | null>(null);
export const useCart = () => { const cart=useContext(CartContext); if(!cart) throw new Error("Cart provider missing"); return cart; };
export function CartProvider({children}: {children: React.ReactNode}) {
  const [items,setItems]=useState<CartItem[]>([]);const itemsRef=useRef(items);
  const [products,setProducts]=useState<CartProduct[]>([]);
  const [ready,setReady]=useState(false);const [verified,setVerified]=useState(false);const [refreshing,setRefreshing]=useState(false);
  const [open,setOpen]=useState(false);const [message,setMessage]=useState("");
  const request=useRef<Promise<CartProduct[] | null> | null>(null);const lastRefresh=useRef(0);
  const commit=useCallback((next: CartItem[])=>{itemsRef.current=next;setItems(next);try{localStorage.setItem(CART_KEY,serializeCart(next));}catch{setMessage("El navegador no permite guardar el carrito en este dispositivo.");}},[]);
  const refresh=useCallback((): Promise<CartProduct[] | null>=>{
    if(request.current) return request.current;
    setRefreshing(true);setVerified(false);
    request.current=(async()=>{
      try {
        const response=await fetch("/api/cart/products",{cache:"no-store"});
        if(!response.ok) throw new Error("Unavailable");
        const result=await response.json();if(!result.available || !Array.isArray(result.products)) throw new Error("Unavailable");
        const current: CartProduct[]=result.products;
        const next=reconcile(itemsRef.current,current);
        if(serializeCart(next)!==serializeCart(itemsRef.current)) setMessage("Actualizamos las cantidades según el stock disponible.");
        commit(next);setProducts(current);setVerified(true);lastRefresh.current=Date.now();return current;
      }catch{setProducts([]);setMessage("No podemos verificar los productos ahora. Inténtalo de nuevo.");return null;}
      finally{setRefreshing(false);request.current=null;}
    })();return request.current;
  },[commit]);
  useEffect(()=>{
    let cancelled=false;
    queueMicrotask(()=>{if(cancelled)return;let initial: CartItem[]=[];try{initial=parseCart(localStorage.getItem(CART_KEY));}catch{}
      itemsRef.current=initial;setItems(initial);setReady(true);if(initial.length)void refresh();
    });
    const storage=(event: StorageEvent)=>{if(event.key===CART_KEY){const next=parseCart(event.newValue);itemsRef.current=next;setItems(next);void refresh();}};
    const focus=()=>{if(itemsRef.current.length && Date.now()-lastRefresh.current>60000)void refresh();};
    window.addEventListener("storage",storage);window.addEventListener("focus",focus);
    return()=>{cancelled=true;window.removeEventListener("storage",storage);window.removeEventListener("focus",focus);};
  },[refresh]);
  const openCart=()=>{setOpen(true);void refresh();};
  const add=async(product: CartProduct,quantity: number)=>{
    const current=await refresh();const fresh=current?.find(p=>p.id===product.id && p.slug===product.slug);
    if(!fresh || !current){setMessage("El producto no está disponible.");return false;}
    const next=addItem(itemsRef.current,fresh,quantity,current);
    if(next===itemsRef.current){setMessage("No puedes añadir esa cantidad. Revisa el stock y el límite de 5 por sabor.");return false;}
    commit(next);setMessage("Producto añadido al carrito.");setOpen(true);return true;
  };
  const change=(id: string,quantity: number)=>{const item=itemsRef.current.find(i=>i.id===id);const product=item && findProduct(item,products);if(!verified || refreshing || !product)return;commit(setQuantity(itemsRef.current,product,quantity,products));};
  const remove=(id: string)=>commit(removeItem(itemsRef.current,id));
  const closeCart=useCallback(()=>setOpen(false),[]);
  const clearPurchased=useCallback((accessId: string,purchased: {id: string; quantity: number}[])=>{
    const marker=`uschh.order-cleared.${accessId}`;
    try{if(localStorage.getItem(marker))return;}catch{}
    const next=itemsRef.current.flatMap(item=>{const bought=purchased.find(line=>line.id===item.id)?.quantity ?? 0;return item.quantity>bought ? [{...item,quantity:item.quantity-bought}] : [];});
    commit(next);try{localStorage.setItem(marker,"true");}catch{}
  },[commit]);
  return <CartContext.Provider value={{items,products,ready,verified,refreshing,message,count:totalUnits(items),open,openCart,closeCart,refresh,add,change,remove,clearPurchased}}>{children}<CartDrawer /></CartContext.Provider>;
}
