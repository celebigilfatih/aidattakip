CREATE TYPE "RenewalDecision" AS ENUM ('UNDECIDED','CONTACT','CONTINUING','LEFT');
CREATE TABLE "seasons" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "seasons_dates_check" CHECK ("endDate" >= "startDate"));
CREATE TABLE "season_enrollments" (
 "id" TEXT PRIMARY KEY, "seasonId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
 "decision" "RenewalDecision" NOT NULL DEFAULT 'UNDECIDED', "targetGroupId" TEXT, "feeTypeId" TEXT, "plannedAmount" DOUBLE PRECISION, "firstDueDate" TIMESTAMP(3), "approvedAt" TIMESTAMP(3), "activatedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "season_enrollments_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "season_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "season_enrollments_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "season_enrollments_feeTypeId_fkey" FOREIGN KEY ("feeTypeId") REFERENCES "fee_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "season_enrollments_amount_check" CHECK ("plannedAmount" IS NULL OR "plannedAmount" > 0)
);
CREATE UNIQUE INDEX "season_enrollments_seasonId_studentId_key" ON "season_enrollments"("seasonId","studentId");
ALTER TABLE "payments" ADD COLUMN "seasonEnrollmentId" TEXT, ADD COLUMN "seasonInstallment" INTEGER;
ALTER TABLE "payments" ADD CONSTRAINT "payments_seasonEnrollmentId_fkey" FOREIGN KEY ("seasonEnrollmentId") REFERENCES "season_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "payments_seasonEnrollmentId_seasonInstallment_key" ON "payments"("seasonEnrollmentId","seasonInstallment");
ALTER TABLE "payments" ADD CONSTRAINT "payments_season_source_check" CHECK (("seasonEnrollmentId" IS NULL AND "seasonInstallment" IS NULL) OR ("seasonEnrollmentId" IS NOT NULL AND "seasonInstallment" > 0));
