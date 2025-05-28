/*
  Warnings:

  - Changed the type of `quantity` on the `RecipeIngredient` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "quantity",
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL;
