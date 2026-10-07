import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { TransferInstructions } from "@/components/checkout/TransferInstructions";
import { orders } from "@/server/commerce/checkout-api";
import { GUEST_COOKIE, requireSession } from "@/server/commerce/order-access";
import { CheckoutError } from "@/lib/checkout/validation";
import styles from "@/components/checkout/checkout.module.css";
export const metadata: Metadata={title:"Tu pedido | USCHH",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function SuccessPage({params}: {params: Promise<{accessId:string}>}) {
  const {accessId}=await params;if(!/^[a-f0-9-]{36}$/i.test(accessId))notFound();
  const cookie=(await cookies()).get(GUEST_COOKIE)?.value;let order;
  try{order=await orders.get(accessId,requireSession(cookie));}
  catch(error){if(error instanceof CheckoutError && (error.code==="ACCESS" || error.code==="SESSION"))notFound();
    return <><Navbar/><main className={styles.page}><h1>Pedido temporalmente no disponible</h1><p>Vuelve a intentarlo. No realices una nueva transferencia.</p></main></>;}
  return <><Navbar/><main className={styles.page}><TransferInstructions order={order}/><Link href="/productos" className={styles.back}>VOLVER A LA TIENDA ↗</Link></main></>;
}
