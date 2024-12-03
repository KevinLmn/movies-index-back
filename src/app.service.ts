import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class AppService {
  private prisma = new PrismaClient();

  constructor(private readonly ConfigService: ConfigService) {}

  async insertMovie(
    language: string,
    isAdult: boolean,
    title: string,
    externalId: string,
    director: string,
    originalLanguage: string,
    overview: string,
    popularity: number,
    releaseDate: string,
    posterPath: string,
    voteAverage: number,
    genres: Array<any>,
  ) {
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    console.log(genres);
    try {
      const movie = await this.prisma.movie.upsert({
        where: {
          externalId: Number(externalId),
        },
        update: {
          [language === 'en_US' ? 'titleEn' : 'titleFr']: title,
          externalId: Number(externalId),
          titleEn: originalLanguage === 'en' ? title : null,
          titleFr: originalLanguage === 'fr' ? title : null,
          isAdult: isAdult,
          director: director,
          originalLanguage: originalLanguage,
          overviewEn: originalLanguage === 'en' ? overview : null,
          overviewFr: originalLanguage === 'fr' ? overview : null,
          popularity: popularity,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          posterPath: posterPath,
          voteAverage: voteAverage,
          MovieGenre: {
            create: genres.map((genre) => ({
              genre: {
                connectOrCreate: {
                  where: { externalId: genre }, // Vérifie si le genre existe
                  create: { externalId: genre }, // Crée le genre si inexistant
                },
              },
            })),
          },
        },
        create: {
          [language === 'en_US' ? 'titleEn' : 'titleFr']: title,
          externalId: Number(externalId),
          titleEn: originalLanguage === 'en' ? title : null,
          titleFr: originalLanguage === 'fr' ? title : null,
          isAdult: isAdult,
          director: director,
          originalLanguage: originalLanguage,
          overviewEn: originalLanguage === 'en' ? overview : null,
          overviewFr: originalLanguage === 'fr' ? overview : null,
          popularity: popularity,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          posterPath: posterPath,
          voteAverage: voteAverage,
          MovieGenre: {
            create: genres.map((genre) => ({
              genre: {
                connectOrCreate: {
                  where: { externalId: genre }, // Vérifie si le genre existe
                  create: { externalId: genre }, // Crée le genre si inexistant
                },
              },
            })),
          },
        },
      });
      console.log(movie, 'got inserted');
    } catch (error) {
      console.error(error);
    }
  }

  async getMovies() {
    try {
      const movies = await this.prisma.movie.findMany({
        take: 20,
      });
      await this.prisma.$disconnect();
      return movies;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllMovies() {
    try {
      const movies = await this.prisma.movie.findMany({});
      await this.prisma.$disconnect();
      return movies;
    } catch (error) {
      console.error(error);
    }
  }

  async scrapGenres() {
    const apiUrl = 'https://api.themoviedb.org/3/genre/movie/list';
    try {
      const response = await axios.get(`${apiUrl}?language=en-US`, {
        params: {
          api_key: this.ConfigService.get<string>('TMDB_API_KEY'),
        },
      });
      return response.data.genres;
    } catch (error) {
      console.error(error);
    }
  }

  async insertGenres(genre) {
    const genreExists = await this.prisma.genre.findUnique({
      where: {
        externalId: genre.id,
      },
    });
    if (!genreExists) {
      await this.prisma.genre.create({
        data: {
          externalId: genre.id,
          nameEn: genre.name,
        },
      });
    } else {
      await this.prisma.genre.update({
        where: {
          externalId: genre.id,
        },
        data: {
          nameEn: genre.name,
        },
      });
    }
    await this.prisma.$disconnect();
  }
}
