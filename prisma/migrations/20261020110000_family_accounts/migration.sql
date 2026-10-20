CREATE TABLE "families" (
 "id" TEXT NOT NULL, "name" TEXT NOT NULL, "branchId" TEXT NOT NULL,
 "archivedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "families_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "families_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "families_branchId_archivedAt_idx" ON "families"("branchId", "archivedAt");
ALTER TABLE "students" ADD COLUMN "familyId" TEXT;
CREATE INDEX "students_familyId_idx" ON "students"("familyId");
ALTER TABLE "students" ADD CONSTRAINT "students_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
