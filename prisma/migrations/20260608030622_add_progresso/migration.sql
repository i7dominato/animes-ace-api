-- CreateTable
CREATE TABLE "Progresso" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "episodioId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "segundos" INTEGER NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Progresso_userId_episodioId_key" ON "Progresso"("userId", "episodioId");

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "Episodio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
