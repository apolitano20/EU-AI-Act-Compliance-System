import { app, BrowserWindow, dialog } from "electron";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const isDev = !app.isPackaged;
const PORT = Number(process.env.PORT ?? 3000);
const DEV_HOST = "localhost";
const PROD_HOST = "127.0.0.1";

// ponytail: hand-mirrored from prisma/migrations — must be updated whenever the
// Prisma schema changes. Upgrade path: ship prisma/migrations/*.sql as resources
// and execute those instead.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "AISystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "systemName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "businessFunction" TEXT, "businessOwner" TEXT, "technicalOwner" TEXT,
    "status" TEXT, "countriesUsed" TEXT, "outputsUsedInEu" TEXT,
    "users" TEXT, "affectedPersons" TEXT, "deploymentContext" TEXT,
    "outputTypes" TEXT, "affectsDecisionsAboutPeople" TEXT,
    "humanReviewOrOverride" TEXT, "impactIfWrong" TEXT, "useCaseNotes" TEXT,
    "systemTypes" TEXT, "decisionLogicType" TEXT,
    "learnedParametersUsedInProduction" TEXT, "underlyingModelOrTool" TEXT,
    "modelProvider" TEXT, "usesGpaiOrLlm" TEXT, "usesRag" TEXT,
    "canCallToolsOrApis" TEXT, "canTakeActions" TEXT, "generatesContent" TEXT,
    "interactsDirectlyWithPeople" TEXT, "usesPersonalData" TEXT,
    "usesSensitiveData" TEXT, "profilesIndividuals" TEXT,
    "dataTypes" TEXT, "dataNotes" TEXT, "buildType" TEXT,
    "vendorName" TEXT, "vendorCountry" TEXT, "modelProviderName" TEXT,
    "modelProviderCountry" TEXT, "brandedUnderOrganisationName" TEXT,
    "vendorBrandVisible" TEXT, "modifiedFineTunedRebrandedOrRepurposed" TEXT,
    "supplyChainNotes" TEXT, "riskDomainFlags" TEXT, "completenessScore" INTEGER
);

CREATE TABLE IF NOT EXISTS "EntityRoleAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "lastAssessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntityRoleAssessment_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AISystem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "EntityRoleAssessment_systemId_key" ON "EntityRoleAssessment"("systemId");
`;

async function initDb(dbFile) {
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${dbFile}` });
  await client.executeMultiple(SCHEMA_SQL);
  await client.close();
}

let serverProcess = null;

function startServer(dbFile) {
  return new Promise((resolve, reject) => {
    const serverJs = path.join(
      process.resourcesPath,
      "app",
      ".next",
      "standalone",
      "server.js"
    );

    if (!fs.existsSync(serverJs)) {
      reject(new Error(`Server not found: ${serverJs}`));
      return;
    }

    const env = {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      DATABASE_FILE: dbFile,
      NODE_ENV: "production",
    };

    serverProcess = spawn(process.execPath, [serverJs], {
      cwd: path.dirname(serverJs),
      env,
      stdio: "pipe",
    });

    let settled = false;
    const resolveOnce = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    serverProcess.stdout.on("data", (data) => {
      const message = data.toString();
      if (message.toLowerCase().includes("ready") || message.toLowerCase().includes("started")) {
        resolveOnce();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("[server]", data.toString());
    });

    serverProcess.on("error", rejectOnce);
    serverProcess.on("exit", (code) => {
      if (code && code !== 0) {
        rejectOnce(new Error(`Server exited with code ${code}.`));
      }
    });

    setTimeout(resolveOnce, 6000);
  });
}

let mainWindow = null;

function createWindow() {
  const host = isDev ? DEV_HOST : PROD_HOST;

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "EU AI Act - AI System Inventory",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  void mainWindow.loadURL(`http://${host}:${PORT}/inventory`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // In dev the already-running Next.js dev server owns the database (dev.db).
    if (!isDev) {
      const dbFile = path.join(app.getPath("userData"), "inventory.db");
      await initDb(dbFile);
      process.env.DATABASE_FILE = dbFile;
      await startServer(dbFile);
    }
    createWindow();
  } catch (error) {
    dialog.showErrorBox("Startup error", String(error));
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", () => {
  serverProcess?.kill();
});
