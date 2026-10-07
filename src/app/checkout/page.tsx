import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import styles from "@/components/checkout/checkout.module.css";
export const metadata: Metadata={title:"Checkout | USCHH",robots:{index:false,follow:false}};
export default function CheckoutPage(){return <><Navbar/><main className={styles.page}><h1>CHECKOUT</h1><CheckoutForm/></main></>;}
