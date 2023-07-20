import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ScoreService } from './score.service';
import { BatchScoreDto } from './dto/batch-score.dto';

import { GetScoreQueryDto } from './dto/get-score-query.dto';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  saveScores(@Body() scores: BatchScoreDto) {
    return this.scoreService.saveScores(scores);
  }

  @Get('/user/:userId')
  getUserScores(
    @Param('userId') userId: string,
    @Query() query: GetScoreQueryDto,
  ) {
    return this.scoreService.getScoresByUser(userId, query.startKey);
  }
}
