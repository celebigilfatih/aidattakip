-- CreateEnum
CREATE TYPE "ProspectStage" AS ENUM ('NEW', 'INVITED', 'ATTENDED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "TrialResult" AS ENUM ('INVITED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');



-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "groupId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "stage" "ProspectStage" NOT NULL DEFAULT 'NEW',
    "convertedStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_visits" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "result" "TrialResult" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospect_activities" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospect_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_convertedStudentId_key" ON "prospects"("convertedStudentId");

-- CreateIndex
CREATE INDEX "prospects_branchId_stage_idx" ON "prospects"("branchId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "trial_visits_prospectId_sessionId_key" ON "trial_visits"("prospectId", "sessionId");

-- CreateIndex
CREATE INDEX "prospect_activities_prospectId_createdAt_idx" ON "prospect_activities"("prospectId", "createdAt");

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_convertedStudentId_fkey" FOREIGN KEY ("convertedStudentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_visits" ADD CONSTRAINT "trial_visits_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "prospects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_visits" ADD CONSTRAINT "trial_visits_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "prospects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

