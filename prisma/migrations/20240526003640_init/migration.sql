-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titleEn" TEXT,
    "titleFr" TEXT,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "externalId" INTEGER NOT NULL,
    "director" TEXT,
    "release" DATETIME,
    "originalLanguage" TEXT,
    "overviewEn" TEXT,
    "overviewFr" TEXT,
    "popularity" REAL,
    "releaseDate" DATETIME,
    "posterPath" TEXT,
    "voteAverage" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_externalId_key" ON "Movie"("externalId");
