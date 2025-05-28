/*
  Warnings:

  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StoreSection" AS ENUM ('DAIRY', 'BEVERAGE', 'DELI', 'BREAKFAST', 'MEAT_SEAFOOD', 'BREAD', 'CHEESE', 'BAKING', 'CANNED', 'SNACK', 'PRODUCE');

-- CreateEnum
CREATE TYPE "Course" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "unit",
ADD COLUMN     "substitutes" TEXT;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "author" TEXT,
ADD COLUMN     "cookTime" INTEGER,
ADD COLUMN     "course" "Course",
ADD COLUMN     "prepTime" INTEGER,
ADD COLUMN     "servings" INTEGER;

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "isOptional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeSection" "StoreSection",
ADD COLUMN     "unit" TEXT;
