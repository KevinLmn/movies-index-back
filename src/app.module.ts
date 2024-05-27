import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import utils from './utils';

@Module({
  imports: [SearchModule, ConfigModule.forRoot({
    isGlobal: true,
    load: [utils],
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
