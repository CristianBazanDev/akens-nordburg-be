-- CreateTable
CREATE TABLE "IndicatorSetting" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorConfig" (
    "id" SERIAL NOT NULL,
    "indicatorSettingId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "monthlyTarget" DOUBLE PRECISION,
    "annualTarget" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorSetting_year_month_key" ON "IndicatorSetting"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorConfig_indicatorSettingId_type_key" ON "IndicatorConfig"("indicatorSettingId", "type");

-- AddForeignKey
ALTER TABLE "IndicatorConfig" ADD CONSTRAINT "IndicatorConfig_indicatorSettingId_fkey" FOREIGN KEY ("indicatorSettingId") REFERENCES "IndicatorSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
