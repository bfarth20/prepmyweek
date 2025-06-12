/*
  Warnings:

  - You are about to drop the column `storeId` on the `Recipe` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_storeId_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "storeId";

-- CreateTable
CREATE TABLE "_GroceryStoreToRecipe" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroceryStoreToRecipe_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroceryStoreToRecipe_B_index" ON "_GroceryStoreToRecipe"("B");

-- AddForeignKey
ALTER TABLE "_GroceryStoreToRecipe" ADD CONSTRAINT "_GroceryStoreToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "GroceryStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroceryStoreToRecipe" ADD CONSTRAINT "_GroceryStoreToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
