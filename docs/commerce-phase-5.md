# USCHH — informe de Fase 5

Panel privado implementado y validado. La migración está aplicada en Supabase. No se creó el primer administrador real: debe crearse deliberadamente con el bootstrap descrito aquí. No se inició otra fase.

## 1. Archivos creados

- `src/server/admin/{auth,password,bootstrap,context,service,export,errors,api}.ts`: autenticación, autorización y operaciones privadas.
- `src/server/admin/admin.test.ts`: 15 pruebas de integración aisladas.
- `scripts/create-admin.ts`: creación deliberada de cuentas individuales.
- `src/components/admin/{AdminForms.tsx,AdminDisplay.tsx,admin.module.css}`: formularios, tablas y diseño adaptable.
- `src/app/admin/layout.tsx`, `error.tsx`, `login/page.tsx`.
- `src/app/admin/(protected)/layout.tsx`, `page.tsx`, `pedidos/page.tsx`, `pedidos/[orderNumber]/page.tsx`, `productos/page.tsx`, `ventas/page.tsx`, `marketing/page.tsx`.
- `src/app/api/admin/auth/{login,logout}/route.ts`, `src/app/api/admin/actions/route.ts`, `src/app/api/admin/export/route.ts`.
- `prisma/migrations/20261007000100_admin_security/migration.sql` y este informe.

## 2. Archivos modificados en esta fase

`prisma/schema.prisma`, `package.json`, `package-lock.json`, `.env.example`, `src/server/commerce/order-lifecycle.ts` y `src/server/commerce/test-database.ts`. ExcelJS se añadió para generar XLSX; el script de pruebas incluye Admin. El servidor PostgreSQL simulado admite las conexiones necesarias para las pruebas de navegador. Las modificaciones previas de otras fases permanecen intactas; no se modificaron homepage, GSAP ni ScrollTrigger en esta fase.

## 3–4. Prisma y migración aplicada

Se conserva Prisma 7 y su configuración existente. Se agregan `AdminSession`, `AdminLoginLimit` y `AdminAuditEvent`, relaciones con `AdminUser`, índices, claves foráneas y restricciones de integridad. Las tres tablas tienen RLS y acceso revocado a PUBLIC/anon/authenticated. El backend usa la conexión PostgreSQL del servidor.

La sexta migración, `20261007000100_admin_security`, fue aplicada mediante `migrate deploy`. Las seis migraciones terminadas están verificadas. No se reinicializó Prisma ni se reseteó la base. `DIRECT_URL` sigue siendo la conexión de migraciones/bootstrap; `DATABASE_URL`, la de ejecución de la aplicación.

## 5. Arquitectura de autenticación

Cada administrador tiene email individual, contraseña y estado activo. Contraseñas: scrypt, sal aleatoria de 32 bytes, clave de 64 bytes, N=32768/r=8/p=3; comparación de tiempo constante. Contraseña inicial: 15–128 caracteres. No hay credenciales predeterminadas ni registro público.

Cada sesión genera un token aleatorio de 256 bits; PostgreSQL guarda únicamente SHA-256 del token. Cookie `uschh_admin_session`: HttpOnly, SameSite=Strict, Secure en producción, expiración de ocho horas. Logout revoca la sesión y elimina la cookie. Cada acceso vuelve a verificar expiración, revocación y administrador activo.

Login usa mensajes genéricos y hash ficticio para usuarios desconocidos. Los límites persistentes son cinco intentos por email y cincuenta globales cada quince minutos; también cuentan los intentos válidos. Locks de PostgreSQL evitan carreras entre instancias. El límite global puede bloquear temporalmente el login bajo abuso; no hay servicio externo de protección en esta fase.

## 6. Bootstrap del primer administrador

No se ejecutó contra Supabase. Antes de usar el panel, el propietario debe ejecutar **localmente y de forma deliberada** el siguiente procedimiento. No enviar la contraseña por chat, guardarla en Git ni persistir estas variables en `.env`.

En PowerShell, desde la raíz del proyecto, con las conexiones reales ya configuradas:

```powershell
$env:ADMIN_BOOTSTRAP_EMAIL = Read-Host 'Email individual del administrador'
$env:ADMIN_BOOTSTRAP_NAME = Read-Host 'Nombre'
$adminSecret = Read-Host 'Contraseña de al menos 15 caracteres' -AsSecureString
try {
  $env:ADMIN_BOOTSTRAP_PASSWORD = [Net.NetworkCredential]::new('', $adminSecret).Password
  $env:ADMIN_BOOTSTRAP_CONFIRM = 'true'
  $env:ADMIN_BOOTSTRAP_ALLOW_ADDITIONAL = 'false'
  npm run admin:create
} finally {
  Remove-Item Env:ADMIN_BOOTSTRAP_EMAIL, Env:ADMIN_BOOTSTRAP_NAME, Env:ADMIN_BOOTSTRAP_PASSWORD, Env:ADMIN_BOOTSTRAP_CONFIRM, Env:ADMIN_BOOTSTRAP_ALLOW_ADDITIONAL -ErrorAction SilentlyContinue
  $adminSecret.Dispose()
}
```

El comando no muestra credenciales, no sobrescribe cuentas existentes y exige confirmación explícita. Si ya existe cualquier administrador, rechaza la creación por defecto. Para una segunda persona, repetir con su propio email y contraseña, estableciendo deliberadamente `ADMIN_BOOTSTRAP_ALLOW_ADDITIONAL='true'`. Registrar creación y actor forma parte de la auditoría. No hay recuperación de contraseña por email ni interfaz de gestión de administradores en esta fase. Abrir `/admin/login` mediante HTTPS en producción.

## 7. Rutas

Páginas: `/admin/login`, `/admin`, `/admin/pedidos`, `/admin/pedidos/USCHH-000001`, `/admin/productos`, `/admin/ventas`, `/admin/marketing`. APIs privadas: POST login/logout/actions y GET export. Login/logout son las únicas operaciones de sesión accesibles sin una sesión activa; logout solo revoca el token presentado. Todas las operaciones de negocio requieren autorización del servidor.

## 8. Dashboard

Ingresos y pedidos pagados de hoy, semana y mes; unidades totales y por sabor; ticket promedio; pendientes, transferencias avisadas sin verificar y reservas vencidas; stock disponible/reservado, alertas de agotado/bajo stock y cinco pedidos recientes. Todas las cifras provienen de PostgreSQL. Fechas de negocio: Ecuador (UTC−5), semana desde el lunes.

## 9. Pedidos

Lista paginada de 25 pedidos; búsqueda por número, nombre/apellido o email; filtros por estado de pedido/pago, aviso de transferencia, vencimiento y fechas. Detalle muestra datos del cliente, cobertura/dirección/instrucciones, productos y precios históricos, subtotal/envío/total, reserva, pago, seguimiento, notas privadas y movimientos de inventario. El importe de envío contra entrega desconocido se conserva como desconocido, sin inventarlo.

## 10. Confirmación bancaria

El aviso del cliente permanece pendiente. Solo un administrador activo puede confirmar recepción, con confirmación explícita en la interfaz. Se reutiliza el servicio transaccional de Fase 4: pago PAID, pedido PAID, reserva CONFIRMED, actor y fechas auditados. El movimiento de confirmación tiene delta cero: no descuenta otra vez las unidades ya reservadas. Repetir la confirmación no duplica inventario ni pago. Una reserva vencida no se confirma automáticamente; exige revisar la operación bancaria y resolver el caso fuera de este flujo.

## 11. Transiciones

Únicamente PAID → PREPARING → SHIPPED → DELIVERED, con pago recibido. Se rechazan saltos y retrocesos. Envío exige transportista y seguimiento; guarda fecha de envío. Entrega guarda su fecha. Reintento del mismo estado es idempotente. Cada cambio efectivo queda auditado.

## 12. Cancelación

Solo pedidos pendientes con reserva; exige motivo y confirmación. La transacción bloquea el pedido, libera unidades una vez, crea movimientos, marca reserva RELEASED/pedido CANCELLED/pago FAILED y registra auditoría y nota. Cancelar nuevamente no suma stock otra vez. Cancelar un pedido pagado se rechaza: no hay reembolso silencioso ni flujo de devoluciones.

## 13. Notas internas

Notas privadas con contenido, autor y fecha. Se añaden sin editar ni eliminar notas previas. El detalle carga las cien más recientes e indica el total. No aparecen en la respuesta pública del pedido ni en Excel.

## 14. Productos e inventario

Limón y Mandarina: edición de precio USD positivo con hasta dos decimales, stock disponible no negativo y estado activo; motivo obligatorio. Las unidades reservadas se calculan aparte. Un ajuste real de stock genera `ADMIN_ADJUSTMENT` con delta, saldo, motivo y administrador. Precio/stock/actividad se auditan; los precios históricos de pedidos no cambian. El formulario comprueba `updatedAt` dentro de un bloqueo transaccional: si cambió el producto o su stock, exige refrescar antes de guardar.

## 15. Ventas

Ingresos, pedidos, ticket promedio, unidades y totales por sabor, con fechas opcionales. Solo pedidos PAID/PREPARING/SHIPPED/DELIVERED con pago PAID y sin reembolso. Se excluyen pendientes, cancelados, pedidos REFUNDED, pagos REFUNDED y pedidos con fecha de reembolso. Se usan los importes históricos Decimal, no el precio actual de producto. No se implementan reembolsos parciales.

## 16. Marketing

Listado paginado/buscable exclusivamente de consentimiento GRANTED vigente, sin retirada y con trazabilidad. Los emails de pedidos sin consentimiento y los consentimientos retirados quedan excluidos. No se envían campañas ni se modifica el consentimiento desde el panel.

## 17. Exportación Excel

XLSX real mediante ExcelJS: datos operativos del cliente/entrega, productos/cantidades, importes, pago, pedido, transportista/seguimiento y fechas. Respeta filtros; límite 5.000 pedidos y consultas por lotes de 250. Descarga autenticada, respuesta no-store y auditoría del número de filas. Selección explícita excluye tokens, contraseñas, hashes, notas internas y secretos. Las cadenas parecidas a fórmulas se escriben como texto, comprobado al releer el XLSX.

## 18. Reservas vencidas

Filtro y contador de vencidas; acción deliberada libera hasta cincuenta pendientes vencidas, más antiguas primero, incluso si el cliente avisó una transferencia todavía no verificada. Revisar esos pagos antes de ejecutar. Cada pedido se bloquea y se vuelve a comprobar dentro de su transacción; reutiliza cancelación/liberación idempotente y deja auditoría. El lote puede completarse parcialmente si hay un error y puede reintentarse sin duplicar devoluciones de stock. El servicio puede reutilizarse para un futuro job autorizado, pero no se configuró cron ni liberación externa automática.

## 19. Seguridad y autorización

Layout y páginas privadas, APIs y métodos de servicio verifican identidad en el servidor. Las mutaciones comprueban origen y cuerpo JSON limitado, validan entradas y exigen confirmación para pagos/cancelación/stock/liberación. No se depende de navegación oculta ni localStorage. Queries Prisma parametrizadas; autorización activa para operaciones del ciclo de pedido. Errores públicos genéricos, metadatos noindex, export sin caché y nuevas tablas protegidas por RLS. No se guardaron credenciales nuevas ni se añadieron secretos a archivos de entrega. `.env` permanece ignorado por Git.

## 20. Pruebas

**51 pruebas automatizadas aprobadas**, incluidas quince de Admin y las existentes de comercio/carrito/checkout: login/sesión/logout/cuenta inactiva/bruteforce; autorización; filtros/detalle; confirmación idempotente; transiciones; cancelación; privacidad de notas; ajustes/versiones/precios históricos; ventas; consentimiento; XLSX; vencimientos y liberación repetida.

Navegador Chromium, build de producción, **1440 y 390 px**: rutas y APIs privadas, login inválido/válido, cookie, estados vacíos de dashboard/pedidos/productos/ventas/marketing, confirmación, notas, preparación/envío/entrega, ajuste, consentimiento, descarga XLSX, liberación y logout. Capturas de login/dashboard inspeccionadas; sin desbordamiento global ni errores JavaScript. Fixtures exclusivamente en PostgreSQL simulado en memoria, con ambas URLs del servidor apuntando explícitamente allí. No es una prueba de carga ni de concurrencia de PostgreSQL de producción.

Verificación adicional de solo lectura con Supabase: homepage, catálogo, dos detalles de producto y acceso Admin sin sesión en ambos tamaños. Sin errores JavaScript; agotado y $15.00 correctos. Homepage y arquitectura de animaciones no se editaron en esta fase.

## 21. Validaciones

Prisma validate/generate, generación de tipos Next, TypeScript, ESLint, pruebas y producción build aprobados. Dependencia nueva ExcelJS 4.4.0: npm audit señala una advertencia moderada heredada de uuid; afecta v3/v5/v6 con buffer proporcionado. ExcelJS usa v4 y este export no usa esas APIs ni carga archivos externos. No se forzó un downgrade incompatible. Existen otras advertencias del árbol previo; este trabajo no certifica que npm audit esté limpio ni actualiza dependencias ajenas a Fase 5.

## 22–23. Datos reales preservados

Verificado por ambas conexiones: Limón **$15.00 USD / stock 0**, Mandarina **$15.00 USD / stock 0**, ambos activos. **Cero pedidos, pagos, movimientos de inventario, contactos de marketing, administradores, sesiones y eventos de auditoría reales** después de las pruebas. No se crearon ventas ni datos ficticios en Supabase. Solo se aplicó el esquema de seguridad.

## 24. Variables

Ejecución: `DATABASE_URL`; migraciones/bootstrap: `DIRECT_URL` (fallback existente a DATABASE_URL). `NODE_ENV=production` controla Secure de cookie; servir con HTTPS. Bootstrap temporal: `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `ADMIN_BOOTSTRAP_NAME` opcional, `ADMIN_BOOTSTRAP_CONFIRM=true`; `ADMIN_BOOTSTRAP_ALLOW_ADDITIONAL` solo para cuentas adicionales deliberadas. No se necesita secret compartido de sesión: los tokens son aleatorios y respaldados por DB.

La transferencia del checkout sigue requiriendo `BANK_TRANSFER_ENABLED=true`, `BANK_NAME`, `BANK_ACCOUNT_HOLDER`, `BANK_ACCOUNT_TYPE`, `BANK_ACCOUNT_NUMBER`; `BANK_ID_NUMBER` opcional. No se inventaron datos bancarios ni se habilitó la transferencia sin configuración real.

## 25. Pendientes antes de operar

Crear deliberadamente la cuenta real con el bootstrap y configurar HTTPS del despliegue. Mantener stock real en cero hasta disponer de cantidades reales; configurar los datos bancarios aprobados antes de aceptar pedidos de transferencia. La creación de cuenta es el único paso pendiente para ingresar al panel real; no hay bloqueo de implementación. Revisión de dependencias existentes, recuperación de cuentas y automatización de vencimientos quedan como trabajos explícitos posteriores. No se integraron pagos externos, correos, logística automatizada ni otra fase.
