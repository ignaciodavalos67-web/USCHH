import "server-only";
export class AdminError extends Error {
  constructor(message: string, public status=400) { super(message); }
}
export function text(value: unknown, label: string, max=200, optional=false) {
  if(typeof value!=="string" || value.length>max || (!optional && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new AdminError(`Revisa ${label}.`);
  return value.trim();
}
export function id(value: unknown) { const result=text(value,"el identificador",128);if(!/^[a-zA-Z0-9_-]+$/.test(result))throw new AdminError("Identificador no válido.");return result; }
