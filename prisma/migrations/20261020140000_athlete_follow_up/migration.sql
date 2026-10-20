-- CreateEnum
CREATE TYPE "AttentionReason" AS ENUM ('ABSENCE', 'OVERDUE', 'SEASON');



-- CreateTable
CREATE TABLE "attention_policies" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "windowDays" INTEGER NOT NULL DEFAULT 30,
    "absenceCount" INTEGER NOT NULL DEFAULT 3,
    "overdueDays" INTEGER NOT NULL DEFAULT 7,
    "endingDays" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" "AttentionReason" NOT NULL,
    "assignedToId" TEXT,
    "nextContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_activities" (
    "id" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attention_policies_branchId_key" ON "attention_policies"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "follow_ups_studentId_reason_key" ON "follow_ups"("studentId", "reason");

-- CreateIndex
CREATE INDEX "follow_up_activities_followUpId_createdAt_idx" ON "follow_up_activities"("followUpId", "createdAt");

-- AddForeignKey
ALTER TABLE "attention_policies" ADD CONSTRAINT "attention_policies_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_activities" ADD CONSTRAINT "follow_up_activities_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "follow_ups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_activities" ADD CONSTRAINT "follow_up_activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

