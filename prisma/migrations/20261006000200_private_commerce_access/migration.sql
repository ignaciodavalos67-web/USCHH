-- Commerce is accessed exclusively through the trusted Prisma backend.
-- Supabase's default grants must not expose orders, notes, admin hashes or consent.
-- No browser-facing RLS policies are created in Phase 1.
DO $$
DECLARE
  commerce_table TEXT;
  browser_role TEXT;
BEGIN
  FOREACH commerce_table IN ARRAY ARRAY[
    'Product', 'Order', 'OrderItem', 'Payment', 'InventoryMovement',
    'OrderNote', 'AdminUser', 'MarketingContact', 'MarketingConsentEvent'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', commerce_table);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', commerce_table);
    FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', commerce_table, browser_role);
      END IF;
    END LOOP;
  END LOOP;

  REVOKE ALL ON SEQUENCE public."Order_number_seq" FROM PUBLIC;
  FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role) THEN
      EXECUTE format('REVOKE ALL ON SEQUENCE public."Order_number_seq" FROM %I', browser_role);
    END IF;
  END LOOP;
END $$;
