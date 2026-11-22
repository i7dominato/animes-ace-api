-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_animeId_fkey";

-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_episodioId_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_respostaDeId_fkey";

-- DropForeignKey
ALTER TABLE "Comentario" DROP CONSTRAINT "Comentario_userId_fkey";

-- DropForeignKey
ALTER TABLE "Episodio" DROP CONSTRAINT "Episodio_animeId_fkey";

-- DropForeignKey
ALTER TABLE "LikeComentario" DROP CONSTRAINT "LikeComentario_comentarioId_fkey";

-- DropForeignKey
ALTER TABLE "LikeComentario" DROP CONSTRAINT "LikeComentario_userId_fkey";

-- DropForeignKey
ALTER TABLE "Progresso" DROP CONSTRAINT "Progresso_animeId_fkey";

-- DropForeignKey
ALTER TABLE "Progresso" DROP CONSTRAINT "Progresso_episodioId_fkey";

-- DropForeignKey
ALTER TABLE "Progresso" DROP CONSTRAINT "Progresso_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLista" DROP CONSTRAINT "UserLista_animeId_fkey";

-- DropForeignKey
ALTER TABLE "UserLista" DROP CONSTRAINT "UserLista_userId_fkey";

-- AddForeignKey
ALTER TABLE "Episodio" ADD CONSTRAINT "Episodio_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLista" ADD CONSTRAINT "UserLista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLista" ADD CONSTRAINT "UserLista_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "Episodio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso" ADD CONSTRAINT "Progresso_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "Episodio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_respostaDeId_fkey" FOREIGN KEY ("respostaDeId") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeComentario" ADD CONSTRAINT "LikeComentario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeComentario" ADD CONSTRAINT "LikeComentario_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
