-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "isFeeSummary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summaryBranchId" TEXT,
ADD COLUMN     "summaryRunId" TEXT;

-- AlterTable
ALTER TABLE "notification_recipients" ADD COLUMN     "primaryDeviceId" TEXT,
ADD COLUMN     "staffPushEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "staff_summary_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weekdays" INTEGER[],
    "time" TEXT NOT NULL DEFAULT '09:00',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "branchId" TEXT,
    "createdById" TEXT NOT NULL,
    "lastEvaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_summary_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_summary_recipients" (
    "ruleId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "staff_summary_recipients_pkey" PRIMARY KEY ("ruleId","recipientId")
);

-- CreateTable
CREATE TABLE "staff_summary_runs" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'AUTOMATIC',
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "accepted" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "staff_summary_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_summary_runs_createdAt_idx" ON "staff_summary_runs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "staff_summary_runs_ruleId_scheduledAt_key" ON "staff_summary_runs"("ruleId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_summaryRunId_recipientId_key" ON "notifications"("summaryRunId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipients_primaryDeviceId_key" ON "notification_recipients"("primaryDeviceId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_summaryRunId_fkey" FOREIGN KEY ("summaryRunId") REFERENCES "staff_summary_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_primaryDeviceId_fkey" FOREIGN KEY ("primaryDeviceId") REFERENCES "push_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_summary_rules" ADD CONSTRAINT "staff_summary_rules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_summary_recipients" ADD CONSTRAINT "staff_summary_recipients_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "staff_summary_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_summary_recipients" ADD CONSTRAINT "staff_summary_recipients_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "notification_recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_summary_runs" ADD CONSTRAINT "staff_summary_runs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "staff_summary_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Retain all history; retire non-staff subscriptions and outstanding invitations.
UPDATE "push_devices" SET "isActive" = false WHERE "recipientId" IN (SELECT id FROM "notification_recipients" WHERE kind <> 'STAFF');
UPDATE "push_invites" SET "usedAt" = CURRENT_TIMESTAMP WHERE "usedAt" IS NULL;
