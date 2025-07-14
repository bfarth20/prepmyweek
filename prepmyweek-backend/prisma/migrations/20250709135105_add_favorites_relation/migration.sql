-- CreateTable
CREATE TABLE "_UserFavoriteRecipes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserFavoriteRecipes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserFavoriteRecipes_B_index" ON "_UserFavoriteRecipes"("B");

-- AddForeignKey
ALTER TABLE "_UserFavoriteRecipes" ADD CONSTRAINT "_UserFavoriteRecipes_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavoriteRecipes" ADD CONSTRAINT "_UserFavoriteRecipes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
