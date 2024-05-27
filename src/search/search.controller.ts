import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from 'src/app.service';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
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
}
