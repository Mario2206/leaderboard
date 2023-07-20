import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatformModule } from './platform/platform.module';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { ScoreModule } from './score/score.module';

@Module({
  imports: [
    PlatformModule,
    CoreModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
