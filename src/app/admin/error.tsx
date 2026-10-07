"use client";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
export default function AdminErrorPage(){return <main className={styles.main}><h1>ADMIN TEMPORALMENTE NO DISPONIBLE</h1><p>No se pudo cargar esta vista. Vuelve a intentarlo; comprueba el estado antes de repetir una operación.</p><Link href="/admin">VOLVER AL PANEL ↗</Link></main>;}
