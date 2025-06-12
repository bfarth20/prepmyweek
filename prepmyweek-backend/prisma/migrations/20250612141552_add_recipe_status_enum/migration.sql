-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "status" "RecipeStatus" NOT NULL DEFAULT 'pending';
