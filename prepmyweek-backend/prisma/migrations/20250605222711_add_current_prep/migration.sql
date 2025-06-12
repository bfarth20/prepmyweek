-- CreateTable
CREATE TABLE "CurrentPrep" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "recipeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentPrep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentPrep_userId_key" ON "CurrentPrep"("userId");

-- AddForeignKey
ALTER TABLE "CurrentPrep" ADD CONSTRAINT "CurrentPrep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
