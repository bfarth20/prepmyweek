-- CreateTable
CREATE TABLE "PastPrep" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PastPrep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PastPrepRecipe" (
    "pastPrepId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,

    CONSTRAINT "PastPrepRecipe_pkey" PRIMARY KEY ("pastPrepId","recipeId")
);

-- AddForeignKey
ALTER TABLE "PastPrep" ADD CONSTRAINT "PastPrep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastPrepRecipe" ADD CONSTRAINT "PastPrepRecipe_pastPrepId_fkey" FOREIGN KEY ("pastPrepId") REFERENCES "PastPrep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastPrepRecipe" ADD CONSTRAINT "PastPrepRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
