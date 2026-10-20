-- Preserve all rules, memberships and sending history.
ALTER TABLE "staff_summary_rules" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "staff_summary_rules" ADD CONSTRAINT "staff_summary_rules_archive_disabled_check" CHECK ("archivedAt" IS NULL OR "enabled" = false);
