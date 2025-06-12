/*
  Warnings:

  - You are about to drop the `_GroceryStoreToRecipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "StoreSection" ADD VALUE 'DRY_GOOD';

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "_GroceryStoreToRecipe" DROP CONSTRAINT "_GroceryStoreToRecipe_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroceryStoreToRecipe" DROP CONSTRAINT "_GroceryStoreToRecipe_B_fkey";

-- DropTable
DROP TABLE "_GroceryStoreToRecipe";

-- CreateTable
CREATE TABLE "RecipeStore" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "RecipeStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStore_recipeId_storeId_key" ON "RecipeStore"("recipeId", "storeId");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStore" ADD CONSTRAINT "RecipeStore_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStore" ADD CONSTRAINT "RecipeStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "GroceryStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
