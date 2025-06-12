-- DropForeignKey
ALTER TABLE "PastPrepRecipe" DROP CONSTRAINT "PastPrepRecipe_pastPrepId_fkey";

-- AddForeignKey
ALTER TABLE "PastPrepRecipe" ADD CONSTRAINT "PastPrepRecipe_pastPrepId_fkey" FOREIGN KEY ("pastPrepId") REFERENCES "PastPrep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
