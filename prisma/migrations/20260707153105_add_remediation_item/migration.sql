-- CreateTable
CREATE TABLE "RemediationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceGapStatus" TEXT NOT NULL,
    "owner" TEXT,
    "dueDate" DATETIME,
    "suggestedDueDate" DATETIME,
    "recurrenceKind" TEXT NOT NULL,
    "cadence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL,
    "priorityOverridden" BOOLEAN NOT NULL DEFAULT false,
    "lastCompletedAt" DATETIME,
    "nextDueAt" DATETIME,
    "legalBasisCitation" TEXT NOT NULL,
    "applicableFromDate" TEXT,
    "guidanceStatus" TEXT NOT NULL,
    "notes" TEXT,
    "generatedFromRoleSet" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RemediationItem_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RemediationItem_systemId_obligationId_key" ON "RemediationItem"("systemId", "obligationId");
