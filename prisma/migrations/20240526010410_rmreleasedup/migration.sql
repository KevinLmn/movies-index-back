/*
  Warnings:

  - You are about to drop the column `release` on the `Movie` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titleEn" TEXT,
    "titleFr" TEXT,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "externalId" INTEGER NOT NULL,
    "director" TEXT,
    "originalLanguage" TEXT,
    "overviewEn" TEXT,
    "overviewFr" TEXT,
    "popularity" REAL,
    "releaseDate" DATETIME,
    "posterPath" TEXT,
    "voteAverage" REAL
);
INSERT INTO "new_Movie" ("director", "externalId", "id", "isAdult", "originalLanguage", "overviewEn", "overviewFr", "popularity", "posterPath", "releaseDate", "titleEn", "titleFr", "voteAverage") SELECT "director", "externalId", "id", "isAdult", "originalLanguage", "overviewEn", "overviewFr", "popularity", "posterPath", "releaseDate", "titleEn", "titleFr", "voteAverage" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE UNIQUE INDEX "Movie_externalId_key" ON "Movie"("externalId");
PRAGMA foreign_key_check("Movie");
PRAGMA foreign_keys=ON;
