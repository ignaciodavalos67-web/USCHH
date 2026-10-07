import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_COOKIE } from "@/server/admin/auth";
import { adminAuth } from "@/server/admin/context";
import { LoginForm } from "@/components/admin/AdminForms";
import styles from "@/components/admin/admin.module.css";
export default async function LoginPage(){if(await adminAuth.current((await cookies()).get(ADMIN_COOKIE)?.value))redirect("/admin");return <main className={styles.login}><Link href="/" className={styles.brand}>uschh</Link><p>ADMINISTRACIÓN PRIVADA</p><h1>INICIAR SESIÓN</h1><LoginForm/></main>;}
