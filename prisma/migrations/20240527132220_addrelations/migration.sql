-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MovieGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("externalId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MovieGenre" ("genreId", "id", "movieId") SELECT "genreId", "id", "movieId" FROM "MovieGenre";
DROP TABLE "MovieGenre";
ALTER TABLE "new_MovieGenre" RENAME TO "MovieGenre";
CREATE UNIQUE INDEX "MovieGenre_movieId_genreId_key" ON "MovieGenre"("movieId", "genreId");
PRAGMA foreign_key_check("MovieGenre");
PRAGMA foreign_keys=ON;
