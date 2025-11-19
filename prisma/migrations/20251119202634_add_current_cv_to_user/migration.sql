-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentCVId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCVId_fkey" FOREIGN KEY ("currentCVId") REFERENCES "TalentCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
