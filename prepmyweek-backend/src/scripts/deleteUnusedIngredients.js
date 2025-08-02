import { prisma } from "../prismaClient.js";

async function deleteUnusedIngredients() {
  const deleted = await prisma.ingredient.deleteMany({
    where: {
      recipes: {
        none: {}, // no linked RecipeIngredient rows
      },
    },
  });

  console.log(`Deleted ${deleted.count} unused ingredients.`);
}

deleteUnusedIngredients()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
