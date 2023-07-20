import { Module } from '@nestjs/common';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { PlatformModule } from 'src/platform/platform.module';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService],
  imports: [PlatformModule],
})
export class ScoreModule {}
