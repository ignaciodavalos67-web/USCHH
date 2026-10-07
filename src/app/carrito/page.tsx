import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { CartContents } from "@/components/cart/CartContents";
import styles from "@/components/cart/cart.module.css";
export const metadata: Metadata={title:"Carrito | USCHH"};
export default function CartPage(){return <><Navbar/><main className={styles.page}><h1>CARRITO</h1><CartContents/></main></>;}
