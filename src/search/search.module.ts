import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from 'src/app.service';
import utils from 'src/utils';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [utils],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, AppService],
})
export class SearchModule {}
