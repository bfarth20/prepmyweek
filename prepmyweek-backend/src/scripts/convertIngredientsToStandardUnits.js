import { PrismaClient } from "@prisma/client";
import {
  getUnitType,
  convertVolumeToTbsp,
  convertWeightToOz,
} from "../utils/unitConversions.js"; // adjust path as needed

const prisma = new PrismaClient();

async function normalizeRecipeIngredients() {
  const allIngredients = await prisma.recipeIngredient.findMany();

  for (const ri of allIngredients) {
    const { id, quantity, unit } = ri;

    if (!unit || quantity == null) continue;
    if (ri.normalizedQuantity != null && ri.normalizedUnit != null) continue;

    let normalizedQuantity = quantity;
    let normalizedUnit = unit;

    try {
      const unitType = getUnitType(unit);
      if (unitType === "volume") {
        normalizedQuantity = convertVolumeToTbsp(quantity, unit);
        normalizedUnit = "tbsp";
      } else if (unitType === "weight") {
        normalizedQuantity = convertWeightToOz(quantity, unit);
        normalizedUnit = "oz";
      }
      // count units stay as-is
    } catch (e) {
      console.warn(`Skipping conversion for id ${id} due to error:`, e);
      continue;
    }

    await prisma.recipeIngredient.update({
      where: { id },
      data: {
        normalizedQuantity,
        normalizedUnit,
      },
    });

    console.log(
      `Updated id ${id}: ${quantity} ${unit} → ${normalizedQuantity} ${normalizedUnit}`
    );
  }

  await prisma.$disconnect();
  console.log("✅ Normalization complete.");
}

normalizeRecipeIngredients().catch((e) => {
  console.error("❌ Error normalizing recipe ingredients:", e);
  process.exit(1);
});
