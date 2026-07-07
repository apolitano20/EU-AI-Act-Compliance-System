-- CreateTable
CREATE TABLE "ModuleAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "lastAssessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModuleAssessment_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleAssessment_systemId_moduleKey_key" ON "ModuleAssessment"("systemId", "moduleKey");
