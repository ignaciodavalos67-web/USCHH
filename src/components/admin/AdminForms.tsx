"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
export function AdminForm({action,children,label,confirmMessage,compact=false}: {action:string;children?:React.ReactNode;label:string;confirmMessage?:string;compact?:boolean}){
 const router=useRouter();const [pending,setPending]=useState(false),[message,setMessage]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(pending)return;const form=event.currentTarget;if(confirmMessage && !window.confirm(confirmMessage))return;setPending(true);setMessage("");
  const data=Object.fromEntries(new FormData(form));const body={...data,action,confirmed:!!confirmMessage,...(action==="product" ? {active:data.active==="on"} : {})};
  try{const response=await fetch("/api/admin/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await response.json();if(response.status===401){router.push("/admin/login");return;}if(!response.ok){setMessage(result.error);return;}setMessage(result.released!==undefined ? `${result.released} reservas liberadas.` : "Cambios guardados.");if(action==="note")form.reset();router.refresh();}catch{setMessage("No pudimos confirmar la respuesta. Actualiza la página antes de volver a intentarlo.");}finally{setPending(false);}
 }
 return <form onSubmit={submit} className={`${styles.form} ${compact ? styles.compactForm : ""}`}>{children}<button className={styles.button} disabled={pending}>{pending ? "PROCESANDO…" : label}</button><p role="status" className={styles.notice}>{message}</p></form>;
}
export function LoginForm(){const router=useRouter();const [pending,setPending]=useState(false),[error,setError]=useState("");async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(pending)return;const data=Object.fromEntries(new FormData(event.currentTarget));setPending(true);try{const response=await fetch("/api/admin/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await response.json();if(!response.ok){setError(result.error);return;}router.replace("/admin");router.refresh();}catch{setError("No podemos iniciar sesión ahora. Inténtalo de nuevo.");}finally{setPending(false);}}
 return <form onSubmit={submit} className={styles.form}><label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required/></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" maxLength={128} required/></label><p role="alert" className={styles.notice}>{error}</p><button className={styles.button} disabled={pending}>{pending ? "VERIFICANDO…" : "INICIAR SESIÓN ↗"}</button></form>;
}
export function Logout(){const router=useRouter();const [error,setError]=useState("");return <div><button className={styles.logout} onClick={async()=>{try{const response=await fetch("/api/admin/auth/logout",{method:"POST"});if(!response.ok)throw new Error();router.replace("/admin/login");router.refresh();}catch{setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");}}}>CERRAR SESIÓN</button><p role="alert">{error}</p></div>;}

export function RejectTransferForm({orderId,orderNumber}: {orderId:string;orderNumber:string}){
  const router=useRouter();
  const [open,setOpen]=useState(false);
  const [reason,setReason]=useState("");
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending)return;
    if(!window.confirm(`¿Confirmas el rechazo de la transferencia para ${orderNumber}?\n\nEsta acción cancelará la solicitud y devolverá el inventario reservado a la tienda.`))return;
    setPending(true);
    setError("");
    try{
      const response=await fetch("/api/admin/actions",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          action:"cancel",
          id:orderId,
          confirmed:true,
          reason:reason.trim() || "Transferencia no validada / rechazada por el administrador",
        }),
      });
      const result=await response.json();
      if(response.status===401){router.push("/admin/login");return;}
      if(!response.ok){setError(result.error);return;}
      setOpen(false);
      router.refresh();
    }catch{
      setError("No pudimos procesar el rechazo. Intenta nuevamente.");
    }finally{
      setPending(false);
    }
  }
  if(!open){
    return <button type="button" onClick={()=>setOpen(true)} className={styles.rejectBtn}>RECHAZAR TRANSFERENCIA</button>;
  }
  return <form onSubmit={submit} className={styles.rejectBox}>
    <label>
      <span style={{fontSize:"11px",opacity:0.8}}>Motivo del rechazo (opcional)</span>
      <input type="text" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ej: No acreditado, valor incorrecto, comprobante no recibido" maxLength={200}/>
    </label>
    <div className={styles.rejectActions}>
      <button type="submit" disabled={pending} className={styles.rejectConfirmBtn}>{pending ? "RECHAZANDO…" : "CONFIRMAR RECHAZO"}</button>
      <button type="button" disabled={pending} onClick={()=>{setOpen(false);setError("");}} className={styles.rejectCancelBtn}>CANCELAR</button>
    </div>
    {error && <p role="alert" className={styles.notice}>{error}</p>}
  </form>;
}

