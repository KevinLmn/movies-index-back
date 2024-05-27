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
      const timestampInMilliseconds = Date.parse(movie.releaseDate);
      const timestamp = timestampInMilliseconds / 1000;
      movie.releaseDate = timestamp;
      await index.addDocuments([movie], {
        primaryKey: 'externalId',
      });
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
    const genresParsed = Object.entries(search.filters).map(([key, value]) => {
      return value ? `genresEN = "${key}"` : null;
    });
    const fromDate = new Date(search.date.from);
    const toDate = new Date(search.date.to);
    const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
    const toTimestamp = Math.floor(toDate.getTime() / 1000);
    const genreCondition = `(${genresParsed
      .filter((filter) => filter !== null)
      .join(' OR ')})`;

    const dateCondition =
      search.date.from &&
      search.date.to &&
      `(releaseDate ${fromTimestamp} TO ${toTimestamp})`;

    const finalFilter = [genreCondition, dateCondition]
      .filter(
        (filter) => filter !== null && filter !== undefined && filter !== '()',
      )
      .join(' AND ');

    // const finalFilter = ['genres IN [Horror, Comedy, Adventure]', dateCondition]
    //   .filter(
    //     (filter) => filter !== null && filter !== undefined && filter !== '()',
    //   )
    //   .join(' OR ');

    try {
      const response = await index.search(search.text || '', {
        filter: finalFilter,
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

  async updateMovieGenre(movie, genres) {
    const index = this.getMovieIndex();
    try {
      const timestampInMilliseconds = Date.parse(movie.releaseDate);
      const timestamp = timestampInMilliseconds / 1000;
      movie.releaseDate = timestamp;
      movie.genreEN = genres.map((genre) => genre.genre.nameEn);
      const response = await index.updateDocuments([movie]);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async setFilterableAttributes() {
    const index = this.getMovieIndex();
    try {
      const response = await index.updateFilterableAttributes([
        'genresEN',
        'releaseDate',
        'popularity',
        'voteAverage',
      ]);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}
