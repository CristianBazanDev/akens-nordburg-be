/*
  Warnings:

  - Added the required column `clientVerbose` to the `Config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add column as nullable first, then update existing rows, then make it NOT NULL
ALTER TABLE "Config" ADD COLUMN     "clientVerbose" TEXT;
UPDATE "Config" SET "clientVerbose" = '' WHERE "clientVerbose" IS NULL;
ALTER TABLE "Config" ALTER COLUMN "clientVerbose" SET NOT NULL;

-- AlterTable
-- Add columns as nullable first, then update existing rows, then make them NOT NULL
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
UPDATE "User" SET "name" = COALESCE("email", 'Usuario'), "updatedAt" = CURRENT_TIMESTAMP WHERE "name" IS NULL OR "updatedAt" IS NULL;
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "location" TEXT,
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "clientId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Process" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "positionId" INTEGER NOT NULL,
    "recruiterId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "processId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessCandidate" (
    "id" SERIAL NOT NULL,
    "processId" INTEGER NOT NULL,
    "talentId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentProfile" (
    "id" SERIAL NOT NULL,
    "talentId" INTEGER NOT NULL,
    "keywords" TEXT[],
    "skills" TEXT[],
    "experience" TEXT,
    "education" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentCV" (
    "id" SERIAL NOT NULL,
    "talentId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyGoal" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "targetProcesses" INTEGER NOT NULL,
    "targetHires" INTEGER NOT NULL,
    "actualProcesses" INTEGER NOT NULL DEFAULT 0,
    "actualHires" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualGoal" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "targetProcesses" INTEGER NOT NULL,
    "targetHires" INTEGER NOT NULL,
    "actualProcesses" INTEGER NOT NULL DEFAULT 0,
    "actualHires" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TalentProfile_talentId_key" ON "TalentProfile"("talentId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyGoal_month_year_key" ON "MonthlyGoal"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualGoal_year_key" ON "AnnualGoal"("year");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStage" ADD CONSTRAINT "ProcessStage_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessCandidate" ADD CONSTRAINT "ProcessCandidate_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessCandidate" ADD CONSTRAINT "ProcessCandidate_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessCandidate" ADD CONSTRAINT "ProcessCandidate_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ProcessStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentProfile" ADD CONSTRAINT "TalentProfile_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentCV" ADD CONSTRAINT "TalentCV_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
