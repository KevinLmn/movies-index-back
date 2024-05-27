import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import MeiliSearch, { Task } from 'meilisearch';

@Injectable()
export class SearchService {
  private client: MeiliSearch;
  constructor(private readonly ConfigService: ConfigService) {
    this.client = new MeiliSearch({
      host: 'http://localhost:7700',
      apiKey: this.ConfigService.get<string>('MEILISEARCH_API_KEY'),
    });
  }

  private getMovieIndex() {
    return this.client.index('movies');
  }

  async insertMovie(movie: any) {
    const index = this.getMovieIndex();
    try {
      await index.addDocuments([movie], { primaryKey: 'externalId' });
    } catch (error) {
      console.error(error);
    }
  }

  async getTaskStatus(taskUid: number): Promise<Task> {
    try {
      const task = await this.client.getTask(taskUid);
      console.log('Task status:', task);
      return task;
    } catch (error) {
      console.error('Error fetching task status:', error);
      throw error;
    }
  }

  async searchMovies(search: any) {
    const index = this.getMovieIndex();
    try {
      const response = await index.search(search.text || '', {
        limit: 24,
        offset: 0,
        attributesToSearchOn: ['titleEn', 'titleFr'],
        attributesToHighlight: ['titleEn', 'titleFr'],
        showRankingScore: true,
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async searchUniqueMovie(id: any) {
    const index = this.getMovieIndex();
    try {
      const response = await index.search(id || '', {
        limit: 1,
        offset: 0,
        attributesToSearchOn: ['externalId'],
        showRankingScore: true,
      });
      return response.hits[0];
    } catch (error) {
      console.error(error);
    }
  }

  async searchRecommandationsImdb(movie: any) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${movie.externalId}/recommendations`;
    try {
      const response = await axios.get(`${apiUrl}`, {
        params: {
          api_key: this.ConfigService.get<string>('TMDB_API_KEY'),
          page: 1,
        },
      });
      return response.data.results;
    } catch (error) {
      console.error(error);
    }
  }

  async searchRecommandations(search: any) {
    const index = this.getMovieIndex();
    try {
      const hits = [];
      for (let i = 0; i < search?.length; i++) {
        const response = await index.search(search[i].id.toString(), {
          limit: 1,
          offset: 0,
          attributesToSearchOn: ['externalId'],
        });
        if (response.hits.length > 0) {
          hits.push(response.hits[0]);
        }
        if (hits.length > 5) break;
      }
      return hits;
    } catch (error) {
      console.error(error);
    }
  }
}
