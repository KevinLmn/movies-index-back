import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly ConfigService: ConfigService) {}

  private readonly apiUrl = 'https://api.themoviedb.org/3';

  @Get('/scrapMovies')
  async scrapDatabase(): Promise<any> {
    const totalResults = 10000;
    const movies = [];
    const resultsPerPage = 20;
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    try {
      for (let page = 1; page <= totalPages; page++) {
        const response = await axios.get(
          `${this.apiUrl}/movie/popular?language=fr-FR`,
          {
            params: {
              api_key: this.ConfigService.get<string>('TMDB_API_KEY'),
              page: page,
            },
          },
        );
        const results = response.data.results;

        for (const movie of results) {
          await this.appService.insertMovie(
            'fr-FR',
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

          // for (const genre of movie.genre) {
          //   await this.appService.insertGenres(movie.movieGenre);
          // }
        }
        movies.push(...response.data.results);
      }
    } catch (error) {
      console.error(error);
    }

    return { count: movies.length, movies: movies.slice(0, totalResults) };
  }

  @Get('/movies')
  async getMovies(): Promise<any> {

    return await this.appService.getMovies();
  }

  @Get('/scrapGenres')
  async getGenres(): Promise<any> {
    try {
      const genres = await this.appService.scrapGenres();
      for (const genre of genres) {
        await this.appService.insertGenres(genre);
      }
      return `${genres.length} genres inserted`;
    } catch (error) {
      console.error(error);
    }
  }
}
