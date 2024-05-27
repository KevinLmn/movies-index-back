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
    try {
      const movie = await this.prisma.movie.findUnique({
        where: {
          externalId: Number(externalId),
        },
      });

      if (!movie) {
        await this.prisma.movie.create({
          data: {
            [language === 'en_US' ? 'titleEn' : 'titleFr']: title,
            externalId: Number(externalId),
            titleEn: language === 'en_US' ? title : null,
            titleFr: language === 'fr-FR' ? title : null,
            isAdult: isAdult,
            director: director,
            originalLanguage: originalLanguage,
            overviewEn: language === 'en_US' ? overview : null,
            overviewFr: language === 'fr-FR' ? overview : null,
            popularity: popularity,
            releaseDate: new Date(releaseDate),
            posterPath: posterPath,
            voteAverage: voteAverage,
            MovieGenre: {
              create: genres.map((genre) => ({
                genre: {
                  connect: {
                    externalId: genre.id,
                  },
                },
              })),
            },
          },
        });
      } else if (true) {
        await this.prisma.movie.update({
          where: {
            externalId: Number(externalId),
          },
          data: {
            releaseDate: new Date(releaseDate),
            [language === 'en-US' ? 'titleEn' : 'titleFr']: title,
            [language === 'en-US' ? 'overviewEn' : 'overviewFr']: overview,
            MovieGenre: {
              create: genres.map((genre, index) => ({
                genre: {
                  connect: {
                    externalId: genre,
                  },
                },
              })),
            },
          },
        });
      }
      await this.prisma.$disconnect();
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
