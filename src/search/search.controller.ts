import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { AppService } from 'src/app.service';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
  private prisma = new PrismaClient();

  constructor(
    private readonly meilisearchService: SearchService,
    private readonly appService: AppService,
  ) {}

  @ApiTags('insert')
  @Get('/insert')
  async insertMovie(): Promise<any> {
    const movies = await this.appService.getAllMovies();
    try {
      for (const movie of movies) {
        await this.meilisearchService.insertMovie(movie);
        if (movie.id % 100 === 0) {
          console.log(`Inserted ${movie.id} movies`);
        }
      }

      return { count: movies.length, done: true };
    } catch (error) {
      console.error(error);
      return { count: movies.length, done: false };
    }
  }

  @Get('task-status/:taskUid')
  async getTaskStatus(@Param('taskUid') taskUid: number): Promise<void> {
    const taskStatus = await this.meilisearchService.getTaskStatus(taskUid);
    console.log('Task status:', taskStatus);
  }

  @Post('/movie')
  async searchMovie(@Body() search): Promise<any> {
    return this.meilisearchService.searchMovies(search);
  }

  @Post('/movie/recommandations')
  async searchRecommandations(@Body() search): Promise<any> {
    return this.meilisearchService.searchRecommandations(search);
  }

  @Get('/movie/:id')
  async searchUniqueMovie(@Param('id') id: string): Promise<any> {
    const movie = await this.meilisearchService.searchUniqueMovie(id);
    const recommandationsIds =
      await this.meilisearchService.searchRecommandationsImdb(movie);
    const recommandations =
      await this.meilisearchService.searchRecommandations(recommandationsIds);
    return { movie, recommandations };
  }

  @Get('/updateMovieGenres')
  async searchUniqueMovieFilter(@Param('id') id: string): Promise<any> {
    try {
      const movies = await this.appService.getAllMovies();
      for (const movie of movies) {
        const genres = await this.prisma.movieGenre.findMany({
          where: {
            movieId: movie.externalId,
          },
          select: {
            genre: {
              select: {
                nameEn: true,
              },
            },
          },
        });
        await this.meilisearchService.updateMovieGenre(movie, genres);
        if (movie.id % 100 === 0) {
          console.log(`Updated ${movie.id} movies`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  @Get('/setFilterableAttributes')
  async setFilterableAttributes(): Promise<any> {
    return await this.meilisearchService.setFilterableAttributes();
  }
}
