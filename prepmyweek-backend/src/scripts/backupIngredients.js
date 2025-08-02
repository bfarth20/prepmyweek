import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";

const prisma = new PrismaClient();

async function backupIngredients() {
  const data = await prisma.recipeIngredient.findMany();
  await writeFile(
    "recipeIngredientsBackup.json",
    JSON.stringify(data, null, 2)
  );
  console.log("✅ Backup saved to recipeIngredientsBackup.json");
  await prisma.$disconnect();
}

backupIngredients().catch((e) => {
  console.error("❌ Failed to back up:", e);
  process.exit(1);
});
