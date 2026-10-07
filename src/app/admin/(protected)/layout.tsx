import Link from "next/link";
import { requireAdminPage } from "@/server/admin/context";
import { Logout } from "@/components/admin/AdminForms";
import styles from "@/components/admin/admin.module.css";
export default async function ProtectedLayout({children}: {children:React.ReactNode}){const admin=await requireAdminPage();return <div className={styles.shell}><aside className={styles.sidebar}><Link href="/admin" className={styles.brand}>uschh</Link><p>ADMIN · {admin.name ?? admin.email}</p><nav aria-label="Administración">{[["/admin","DASHBOARD"],["/admin/pedidos","PEDIDOS"],["/admin/productos","PRODUCTOS"],["/admin/ventas","VENTAS"],["/admin/marketing","MARKETING"]].map(([href,label])=><Link key={href} href={href}>{label} ↗</Link>)}</nav><Logout/><Link href="/productos" className={styles.publicLink}>VER TIENDA ↗</Link></aside><main className={styles.main}>{children}</main></div>;}
