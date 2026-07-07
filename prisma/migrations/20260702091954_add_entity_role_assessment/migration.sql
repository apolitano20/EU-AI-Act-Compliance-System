-- CreateTable
CREATE TABLE "EntityRoleAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "lastAssessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntityRoleAssessment_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EntityRoleAssessment_systemId_key" ON "EntityRoleAssessment"("systemId");
