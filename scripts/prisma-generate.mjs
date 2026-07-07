import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const clientEntry = path.resolve("src/generated/prisma/client.ts");
const prismaBinary = path.resolve(
  process.platform === "win32" ? "node_modules/.bin/prisma.cmd" : "node_modules/.bin/prisma"
);

const result = spawnSync(prismaBinary, ["generate"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (result.status === 0) {
  process.exit(0);
}

if (existsSync(clientEntry)) {
  console.warn("Prisma generate failed; continuing with the existing generated client.");
  process.exit(0);
}

process.exit(result.status ?? 1);
