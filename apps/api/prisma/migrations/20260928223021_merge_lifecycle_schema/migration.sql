/*
  Warnings:

  - The `status` column on the `lab_instances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[providerRuntimeId]` on the table `lab_instances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MachineState" AS ENUM ('CREATED', 'STOPPED', 'STARTING', 'RUNNING', 'STOPPING', 'EXPIRED', 'ERROR');

-- AlterTable
ALTER TABLE "lab_instances" ADD COLUMN     "lastLifecycleError" TEXT,
ADD COLUMN     "providerRuntimeId" TEXT,
ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "machineId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MachineState" NOT NULL DEFAULT 'CREATED';

-- CreateIndex
CREATE UNIQUE INDEX "lab_instances_providerRuntimeId_key" ON "lab_instances"("providerRuntimeId");

-- CreateIndex
CREATE INDEX "lab_instances_status_idx" ON "lab_instances"("status");
