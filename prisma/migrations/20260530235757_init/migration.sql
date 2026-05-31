-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "avatar" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anime" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" TEXT NOT NULL,
    "capa" TEXT,
    "generos" TEXT[],
    "nota" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em_exibicao',

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episodio" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "urlVideo" TEXT NOT NULL,
    "duracao" INTEGER,

    CONSTRAINT "Episodio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLista" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'quero_ver',
    "favoritado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserLista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserLista_userId_animeId_key" ON "UserLista"("userId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_userId_animeId_key" ON "Avaliacao"("userId", "animeId");

-- AddForeignKey
ALTER TABLE "Episodio" ADD CONSTRAINT "Episodio_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLista" ADD CONSTRAINT "UserLista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLista" ADD CONSTRAINT "UserLista_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
