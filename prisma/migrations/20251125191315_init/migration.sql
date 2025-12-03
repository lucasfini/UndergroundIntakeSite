-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('SUBMITTED', 'QUEUED', 'IN_PROGRESS', 'REVIEW', 'COMPLETE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "zendeskTicketId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPosition" TEXT,
    "service" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT,
    "eventLocation" TEXT,
    "eventLink" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "callToAction" TEXT,
    "additionalInfo" TEXT,
    "selectedPackage" TEXT,
    "selectedPackageName" TEXT,
    "selectedPackagePrice" DOUBLE PRECISION,
    "selectedAddOns" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uploadedFiles" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "queuePosition" INTEGER,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimatedCompletionDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "oldStatus" "ProjectStatus",
    "newStatus" "ProjectStatus" NOT NULL,
    "changedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_submissionId_key" ON "Project"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_zendeskTicketId_key" ON "Project"("zendeskTicketId");

-- CreateIndex
CREATE INDEX "Project_customerEmail_idx" ON "Project"("customerEmail");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_queuePosition_idx" ON "Project"("queuePosition");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "StatusHistory_projectId_idx" ON "StatusHistory"("projectId");

-- CreateIndex
CREATE INDEX "StatusHistory_createdAt_idx" ON "StatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
