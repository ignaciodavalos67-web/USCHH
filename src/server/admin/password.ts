import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
const N=32768, r=8, p=3;
const derive=(password:string,salt:Buffer)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N,r,p,maxmem:64*1024*1024},(error,key)=>error ? reject(error) : resolve(key)));
export const DUMMY_HASH=`scrypt$${N}$${r}$${p}$${"00".repeat(32)}$${"00".repeat(64)}`;
export async function hashPassword(password: string) {
  if(password.length<15 || password.length>128)throw new Error("La contraseña debe tener entre 15 y 128 caracteres.");
  const salt=randomBytes(32),key=await derive(password,salt);return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${key.toString("hex")}`;
}
export async function verifyPassword(password:string,encoded:string) {
  const parts=encoded.split("$");
  const valid=parts.length===6 && parts[0]==="scrypt" && parts[1]===String(N) && parts[2]===String(r) && parts[3]===String(p) && /^[a-f0-9]{64}$/.test(parts[4]) && /^[a-f0-9]{128}$/.test(parts[5]);
  const source=valid ? parts : DUMMY_HASH.split("$");const key=await derive(password,Buffer.from(source[4],"hex"));return valid && timingSafeEqual(key,Buffer.from(source[5],"hex"));
}
