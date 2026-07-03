-- CreateTable
CREATE TABLE "LikeComentario" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "comentarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikeComentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikeComentario_userId_comentarioId_key" ON "LikeComentario"("userId", "comentarioId");

-- AddForeignKey
ALTER TABLE "LikeComentario" ADD CONSTRAINT "LikeComentario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeComentario" ADD CONSTRAINT "LikeComentario_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
