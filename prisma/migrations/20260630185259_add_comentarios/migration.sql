-- CreateTable
CREATE TABLE "Comentario" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "episodioId" INTEGER NOT NULL,
    "respostaDeId" INTEGER,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "Episodio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_respostaDeId_fkey" FOREIGN KEY ("respostaDeId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
