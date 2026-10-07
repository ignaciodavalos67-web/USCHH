CREATE TABLE "AdminSession" (
 "id" TEXT NOT NULL PRIMARY KEY, "tokenHash" VARCHAR(64) NOT NULL, "adminId" TEXT NOT NULL,
 "expiresAt" TIMESTAMPTZ(3) NOT NULL, "revokedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "AdminSession_expiry" CHECK ("expiresAt" > "createdAt")
);
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");
CREATE TABLE "AdminLoginLimit" (
 "key" VARCHAR(64) NOT NULL PRIMARY KEY, "attempts" INTEGER NOT NULL DEFAULT 0, "resetAt" TIMESTAMPTZ(3) NOT NULL,
 CONSTRAINT "AdminLoginLimit_attempts_nonnegative" CHECK ("attempts" >= 0)
);
CREATE TABLE "AdminAuditEvent" (
 "id" TEXT NOT NULL PRIMARY KEY, "adminId" TEXT NOT NULL, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL,
 "details" JSONB, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AdminAuditEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AdminAuditEvent_entityType_entityId_createdAt_idx" ON "AdminAuditEvent"("entityType", "entityId", "createdAt");
CREATE INDEX "AdminAuditEvent_adminId_createdAt_idx" ON "AdminAuditEvent"("adminId", "createdAt");
DO $$
DECLARE private_table TEXT; browser_role TEXT;
BEGIN
 FOREACH private_table IN ARRAY ARRAY['AdminSession','AdminLoginLimit','AdminAuditEvent'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', private_table);
  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', private_table);
  FOREACH browser_role IN ARRAY ARRAY['anon','authenticated'] LOOP
   IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=browser_role) THEN
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I',private_table,browser_role);
   END IF;
  END LOOP;
 END LOOP;
END $$;