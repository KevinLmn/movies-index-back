import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly ConfigService: ConfigService,
  ) {}

  private readonly apiUrl = 'https://api.themoviedb.org/3';

  @Get('/getMovies')
  async scrapDatabase(): Promise<any> {
    const totalResults = 1000;
    const movies = [];

    const fetchMovies = async () => {
      try {
        for (let i = 1960; i <= 2024; i++) {
          for (let page = 1; page <= 500; page++) {
            const response = await axios.get(
              `${this.apiUrl}/discover/movie?language=fr-FR&primary_release_year=${i}`,
              {
                params: {
                  api_key: this.ConfigService.get<string>('TMDB_API_KEY'),
                  page: page,
                  sort_by: 'popularity.desc',
                },
              },
            );
            const results = response.data.results;

            for (const movie of results) {
              await this.appService.insertMovie(
                'en_US',
                movie.adult,
                movie.title,
                movie.id,
                'director',
                movie.original_language,
                movie.overview,
                movie.popularity,
                movie.release_date,
                movie.poster_path,
                movie.vote_average,
                movie.genre_ids,
              );
            }
            movies.push(...response.data.results);
            console.log(`Inserted ${movies.length} movies`);
          }
        }
      } catch (error) {
        console.error(error);
      }

      return { count: movies.length, movies: movies.slice(0, totalResults) };
    };

    await fetchMovies();
  }

  @Get('/movies')
  async getMovies(): Promise<any> {
    return await this.appService.getMovies();
  }

  @Get('/getGenres')
  async getGenres(): Promise<any> {
    try {
      const genres = await this.appService.scrapGenres();
      for (const genre of genres) {
        await this.appService.insertGenres(genre);
        console.log(genre, 'got inserted');
      }
      return `${genres.length} genres inserted`;
    } catch (error) {
      console.error(error);
    }
  }
}
