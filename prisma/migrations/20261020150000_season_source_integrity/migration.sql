-- Complete the new nullable source pair without changing existing payments or constraints.
ALTER TABLE "payments" ADD CONSTRAINT "payments_season_source_complete_check"
CHECK (("seasonEnrollmentId" IS NULL AND "seasonInstallment" IS NULL)
 OR ("seasonEnrollmentId" IS NOT NULL AND "seasonInstallment" IS NOT NULL AND "seasonInstallment" > 0));
