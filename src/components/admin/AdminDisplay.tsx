import Link from "next/link";
import { formatMoney,formatOrderNumber } from "@/server/commerce/policies";
import { Prisma } from "@/generated/prisma/client";
import type { createAdminService, Filters, TransferState } from "@/server/admin/service";
import { AdminForm, RejectTransferForm } from "./AdminForms";
import styles from "./admin.module.css";
export const labels:Record<string,string>={
  PENDING_PAYMENT:"PENDIENTE DE PAGO",PAID:"PAGADO",PREPARING:"EN PREPARACIÓN",SHIPPED:"ENVIADO",DELIVERED:"ENTREGADO",CANCELLED:"CANCELADO",REFUNDED:"REEMBOLSADO",
  PENDING:"PENDIENTE",FAILED:"FALLIDO",BANK_TRANSFER:"TRANSFERENCIA",CARD:"TARJETA (PAYPHONE)",PAYPHONE:"PAYPHONE",FREE:"GRATIS",PAY_ON_DELIVERY:"PAGADO AL RECIBIR",
  UNFULFILLED:"POR PREPARAR",EXCEPTION_INSUFFICIENT_STOCK:"⚠️ EXCEPCIÓN DE INVENTARIO",
};
export const date=(value:Date|null|undefined)=>value ? new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"medium",timeStyle:"short"}).format(value) : "—";
export const money=(value:Prisma.Decimal|null|undefined)=>formatMoney(value ?? new Prisma.Decimal(0),"USD");
export const status=(value:string)=>labels[value] ?? value;
type OrderRows=Awaited<ReturnType<ReturnType<typeof createAdminService>["listOrders"]>>["orders"];
export function OrdersTable({orders}: {orders:OrderRows}){if(!orders.length)return <p className={styles.empty}>NO HAY PEDIDOS PARA ESTOS FILTROS.</p>;return <div className={styles.tableWrap}><table><thead><tr>{["Pedido / Fecha","Cliente","Total","Pago","Estado","Transferencia","Zona"].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><Link href={`/admin/pedidos/${formatOrderNumber(order.number)}`}>{formatOrderNumber(order.number)} ↗</Link><small>{date(order.createdAt)}</small></td><td>{order.firstName} {order.lastName}</td><td>{money(order.total)}</td><td>{order.payments.map((p,i)=><small key={i}>{status(p.method)}{p.provider ? ` (${p.provider})` : ""} · {status(p.status)}</small>)}</td><td>{status(order.status)}</td><td>{order.payments.some(p=>p.method==="CARD") ? "TARJETA" : order.payments.some(p=>p.customerMarkedTransferredAt) ? "AVISADA POR CLIENTE" : "SIN AVISO"}</td><td>{order.city}</td></tr>)}</tbody></table></div>;}
type TransferRows=Awaited<ReturnType<ReturnType<typeof createAdminService>["transfers"]>>["orders"];
export function TransfersTable({orders}: {orders:TransferRows}){
  if(!orders.length)return <p className={styles.empty}>NO HAY TRANSFERENCIAS EN ESTE ESTADO.</p>;
  return <div className={styles.transfersList}>
    {orders.map(order=>{
      const payment=order.payments[0];
      const confirmable=order.status==="PENDING_PAYMENT" && order.reservationStatus==="RESERVED" && payment?.status==="PENDING" && !order.isExpired;
      const rejectable=order.status==="PENDING_PAYMENT" && order.reservationStatus==="RESERVED";
      return <article key={order.id} className={styles.transferCard}>
        <div className={styles.transferCardHeader}>
          <div>
            <span className={styles.transferSectionTitle}>Referencia de transferencia</span>
            <h3 className={styles.transferCardTitle}>{formatOrderNumber(order.number)}</h3>
            <span className={styles.transferCardMeta}>
              Solicitud realizada: <strong>{date(order.createdAt)}</strong>
              {payment?.customerMarkedTransferredAt && <> · Notificación del cliente: <strong>{date(payment.customerMarkedTransferredAt)}</strong></>}
            </span>
          </div>
          <div>
            {order.status==="PAID" ? (
              <span className={styles.badgePaidStatus}>✓ Pago completado / Confirmado</span>
            ) : order.status==="CANCELLED" ? (
              <span className={styles.badgeCancelledStatus}>✕ Transferencia rechazada / Cancelada</span>
            ) : order.isExpired ? (
              <span className={styles.badgeCancelledStatus}>⚠ Reserva vencida (24h)</span>
            ) : (
              <span className={styles.badgePendingStatus}>⏳ Pendiente de confirmación</span>
            )}
          </div>
        </div>

        <div className={styles.transferCardGrid}>
          <div className={styles.transferCardSection}>
            <span className={styles.transferSectionTitle}>Datos del cliente</span>
            <p><strong>Nombre:</strong> {order.firstName} {order.lastName}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Teléfono:</strong> {order.phone}</p>
          </div>

          <div className={styles.transferCardSection}>
            <span className={styles.transferSectionTitle}>Datos de entrega</span>
            <p><strong>Provincia / Ciudad:</strong> {order.province}, {order.city}{order.area ? ` (${order.area})` : ""}</p>
            <p><strong>Dirección:</strong> {order.address}</p>
            <p><strong>Instrucciones adicionales:</strong> {order.deliveryInstructions ? order.deliveryInstructions : "Ninguna"}</p>
          </div>

          <div className={styles.transferCardSection}>
            <span className={styles.transferSectionTitle}>Productos comprados</span>
            <table className={styles.transferItemsTable}>
              <thead>
                <tr>
                  <th>Sabor</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item=>(
                  <tr key={item.id}>
                    <td><strong>{item.flavor}</strong></td>
                    <td>{item.quantity}</td>
                    <td>{money(item.unitPrice)}</td>
                    <td><strong>{money(item.lineTotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.transferTotals}>
              <div className={styles.transferTotalsRow}>
                <span>Subtotal general:</span>
                <span>{money(order.subtotal)}</span>
              </div>
              <div className={styles.transferTotalsRow}>
                <span>Costo de envío:</span>
                <span>
                  {order.shippingAmount !== null
                    ? money(order.shippingAmount)
                    : order.shippingMode === "FREE"
                    ? "Envío gratis ($0.00)"
                    : "Por pagar al recibir"}
                </span>
              </div>
              <div className={styles.transferTotalsFinal}>
                <span>Total a transferir:</span>
                <span>{money(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.transferCardFooter}>
          <Link href={`/admin/pedidos/${formatOrderNumber(order.number)}`} className={styles.reviewLink} style={{maxWidth:"220px"}}>
            REVISAR DETALLES COMPLETOS ↗
          </Link>

          <div className={styles.transferActions}>
            {confirmable && (
              <AdminForm
                action="confirm"
                compact
                label="CONFIRMAR TRANSFERENCIA"
                confirmMessage={`¿Has verificado en la cuenta de Produbanco el ingreso exacto de ${money(order.total)} para ${formatOrderNumber(order.number)}?\n\nAl confirmar:\n• Se marcará el pago como completado.\n• Se confirmará el pedido y se descontará definitivamente el inventario.\n• Se enviará un correo automático de confirmación al cliente.\n• El pedido pasará al listado de pedidos confirmados.`}
              >
                <input type="hidden" name="id" value={order.id}/>
              </AdminForm>
            )}

            {rejectable && (
              <RejectTransferForm
                orderId={order.id}
                orderNumber={formatOrderNumber(order.number)}
              />
            )}
          </div>
        </div>
      </article>;
    })}
  </div>;
}
export function Pagination({page,count,base,filters}: {page:number;count:number;base:string;filters:Filters}){const url=(next:number)=>{const params=new URLSearchParams(Object.entries({...filters,page:String(next)}).filter(([,value])=>!!value) as [string,string][]);return `${base}?${params}`;};return <nav className={styles.pagination} aria-label="Paginación">{page>1 && <Link href={url(page-1)}>← ANTERIOR</Link>}<span>Página {page} · {count} resultados</span>{page*25<count && <Link href={url(page+1)}>SIGUIENTE →</Link>}</nav>;}
export function TransferPagination({page,count,state}: {page:number;count:number;state:TransferState}){const url=(next:number)=>`/admin/transferencias?state=${state}&page=${next}`;return <nav className={styles.pagination} aria-label="Paginación de transferencias">{page>1 && <Link href={url(page-1)}>← ANTERIOR</Link>}<span>Página {page} · {count} resultados</span>{page*25<count && <Link href={url(page+1)}>SIGUIENTE →</Link>}</nav>;}
export function DateFilter({filters}: {filters:Filters}){return <form className={styles.filters}><label>Desde<input type="date" name="from" defaultValue={filters.from}/></label><label>Hasta<input type="date" name="to" defaultValue={filters.to}/></label><button className={styles.button}>FILTRAR</button></form>;}
export function SalesMetrics({metrics}: {metrics:Awaited<ReturnType<ReturnType<typeof createAdminService>["sales"]>>}){return <><div className={styles.metrics}>{[["Ingresos del periodo",money(metrics.all._sum.total)],["Ingresos hoy",money(metrics.today._sum.total)],["Ingresos esta semana",money(metrics.week._sum.total)],["Ingresos este mes",money(metrics.month._sum.total)],["Pedidos pagados hoy",metrics.today._count._all],["Pedidos pagados esta semana",metrics.week._count._all],["Pedidos pagados este mes",metrics.month._count._all],["Unidades vendidas",metrics.units],["Ticket promedio",money(metrics.all._avg.total)]].map(([label,value])=><div className={styles.metric} key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}</div><div className={styles.metrics}>{["LIMÓN","MANDARINA"].map(flavor=><div key={flavor} className={styles.metric}><span>Unidades {flavor}</span><strong>{metrics.flavors.find(row=>row.flavor===flavor)?._sum.quantity ?? 0}</strong></div>)}</div></>;}
