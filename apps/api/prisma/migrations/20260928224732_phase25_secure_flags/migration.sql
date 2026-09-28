/*
  Warnings:

  - Added the required column `updatedAt` to the `flags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'FLAG_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'FLAG_ROTATED';
ALTER TYPE "AuditAction" ADD VALUE 'FLAG_DEACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'FLAG_SUBMISSION_CORRECT';
ALTER TYPE "AuditAction" ADD VALUE 'FLAG_SUBMISSION_INCORRECT';
ALTER TYPE "AuditAction" ADD VALUE 'FLAG_SUBMISSION_RATE_LIMITED';

-- AlterTable
ALTER TABLE "flags" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "taskId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "machineId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "flags_taskId_idx" ON "flags"("taskId");

-- AddForeignKey
ALTER TABLE "flags" ADD CONSTRAINT "flags_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
