/*
  Warnings:

  - You are about to drop the column `movieId` on the `Genre` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nameEn" TEXT,
    "nameFr" TEXT,
    "externalId" INTEGER NOT NULL
);
INSERT INTO "new_Genre" ("externalId", "id", "nameEn", "nameFr") SELECT "externalId", "id", "nameEn", "nameFr" FROM "Genre";
DROP TABLE "Genre";
ALTER TABLE "new_Genre" RENAME TO "Genre";
CREATE UNIQUE INDEX "Genre_externalId_key" ON "Genre"("externalId");
PRAGMA foreign_key_check("Genre");
PRAGMA foreign_keys=ON;
