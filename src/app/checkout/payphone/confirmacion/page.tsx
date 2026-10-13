import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { payphoneService } from "@/server/commerce/checkout-api";
import { CheckoutError } from "@/lib/checkout/validation";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = {
  title: "Confirmación de Pago | USCHH",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    id?: string;
    clientTransactionId?: string;
  }>;
};

export default async function PayphoneConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id;
  const clientTxId = params.clientTransactionId;

  if (!id || !clientTxId) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.confirmationContainer}>
            <h1 className={styles.confirmationTitle}>PARÁMETROS INCOMPLETOS</h1>
            <div className={styles.confirmationMessage}>
              <p>No se recibieron los datos requeridos para verificar la transacción de PayPhone.</p>
            </div>
            <Link href="/checkout" className={styles.back}>
              VOLVER AL CHECKOUT ↗
            </Link>
          </div>
        </main>
      </>
    );
  }

  let accessId: string | null = null;
  let errorMessage: string | null = null;

  try {
    const result = await payphoneService.confirm({
      id,
      clientTransactionId: clientTxId,
    });
    accessId = result.accessId ?? null;
  } catch (error) {
    if (error instanceof CheckoutError) {
      errorMessage = error.message;
    } else {
      errorMessage = "Ocurrió un error inesperado al confirmar la transacción.";
    }
  }

  if (accessId) {
    redirect(`/checkout/exito/${accessId}`);
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.confirmationContainer}>
          <h1 className={styles.confirmationTitle}>PAGO NO COMPLETADO</h1>
          <div className={styles.confirmationMessage}>
            <p>{errorMessage}</p>
            <p>
              Si el importe fue debitado de tu cuenta o necesitas ayuda, por favor ponte en contacto con nuestro equipo de atención con la referencia indicada abajo.
            </p>
          </div>
          <div className={styles.confirmationDetailsBox}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Referencia de transacción</span>
              <span className={styles.detailValue}>{clientTxId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID PayPhone</span>
              <span className={styles.detailValue}>{id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Estado</span>
              <span className={styles.statusRejected}>No confirmado</span>
            </div>
          </div>
          <div style={{ marginTop: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/checkout" className={styles.back}>
              VOLVER AL CHECKOUT ↗
            </Link>
            <Link href="/contacto" className={styles.back} style={{ opacity: 0.8 }}>
              CONTACTAR A SOPORTE
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
