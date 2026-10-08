import Link from "next/link";
import { adminService,requireAdminPage } from "@/server/admin/context";
import type { TransferFilters,TransferState } from "@/server/admin/service";
import { TransfersTable,TransferPagination } from "@/components/admin/AdminDisplay";
import styles from "@/components/admin/admin.module.css";

const sections:{state:TransferState;label:string}[]=[
  {state:"review",label:"PENDIENTES DE REVISIÓN"},
  {state:"pending",label:"PENDIENTES DE PAGO"},
  {state:"confirmed",label:"CONFIRMADAS"},
  {state:"closed",label:"CANCELADAS / REEMBOLSADAS"},
];

export default async function Transfers({searchParams}: {searchParams:Promise<TransferFilters>}){
  await requireAdminPage();
  const data=await adminService.transfers(await searchParams);
  const current=sections.find(section=>section.state===data.state)!;
  return <>
    <h1>TRANSFERENCIAS</h1>
    <p className={styles.help}>El aviso del cliente no confirma el pago. Verifica el ingreso en el banco antes de confirmar una transferencia. La confirmación conserva el pedido y convierte su reserva en venta sin descontar inventario nuevamente.</p>
    <nav className={styles.transferNav} aria-label="Estados de transferencias">{sections.map(section=><Link key={section.state} href={`/admin/transferencias?state=${section.state}`} className={data.state===section.state ? styles.activeTransfer : undefined}><span>{section.label}</span><strong>{data.counts[section.state]}</strong></Link>)}</nav>
    <section className={styles.section}><h2>{current.label}</h2><TransfersTable orders={data.orders}/><TransferPagination page={data.page} count={data.count} state={data.state}/></section>
  </>;
}
