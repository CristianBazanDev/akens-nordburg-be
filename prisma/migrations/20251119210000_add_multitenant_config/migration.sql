-- Agregar campos tenant y clientId como opcionales primero
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "tenant" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

-- Actualizar registros existentes con valores por defecto
UPDATE "Config" 
SET 
  "tenant" = COALESCE("tenant", 'default'),
  "clientId" = COALESCE("clientId", 'main-client'),
  "clientVerbose" = COALESCE("clientVerbose", 'Main Tenant')
WHERE "tenant" IS NULL OR "clientId" IS NULL;

-- Ahora hacer los campos requeridos y únicos
ALTER TABLE "Config" ALTER COLUMN "tenant" SET NOT NULL;
ALTER TABLE "Config" ALTER COLUMN "clientId" SET NOT NULL;

-- Agregar constraints únicos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Config_tenant_key') THEN
    ALTER TABLE "Config" ADD CONSTRAINT "Config_tenant_key" UNIQUE ("tenant");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Config_clientId_key') THEN
    ALTER TABLE "Config" ADD CONSTRAINT "Config_clientId_key" UNIQUE ("clientId");
  END IF;
END $$;

-- Agregar nuevos campos de configuración multitenant
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Agregar campos de paleta de colores
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "textColor" TEXT;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "textSecondaryColor" TEXT;

-- Agregar campos JSON para configuración flexible
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "themeConfig" JSONB;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Crear índices
CREATE INDEX IF NOT EXISTS "Config_tenant_idx" ON "Config"("tenant");
CREATE INDEX IF NOT EXISTS "Config_clientId_idx" ON "Config"("clientId");
CREATE INDEX IF NOT EXISTS "Config_isActive_idx" ON "Config"("isActive");

