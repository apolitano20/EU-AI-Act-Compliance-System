import { config } from "dotenv";
config();

import { prisma } from "../src/lib/db";
import { repairAISystemRecords } from "../src/lib/inventory-repair";

async function main() {
  const result = await repairAISystemRecords(prisma);
  console.log(`Checked ${result.checked} systems and updated ${result.updated}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
