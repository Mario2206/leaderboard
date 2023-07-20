import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BatchScoreDto, ScoreDto } from './dto/batch-score.dto';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PlatformService } from 'src/platform/platform.service';
import { groupBy } from 'src/utils/groupBy';
import { ScoreItemKeyDto } from './dto/get-score-query.dto';

@Injectable()
export class ScoreService {
  private BATCH_LIMIT = 100;

  constructor(
    private readonly dynamoDB: DocumentClient,
    private readonly platformService: PlatformService,
  ) {}

  async getScoresByUser(userId: string, startKey?: ScoreItemKeyDto) {
    try {
      // Get score items by userId.
      // It uses the secondary index ByUserIdAndScore to get the items sorted by score
      const { Items, LastEvaluatedKey } = await this.dynamoDB
        .query({
          TableName: 'Scores',
          IndexName: 'ByUserIdAndScore',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
          ExclusiveStartKey: startKey, // If we have a startKey, we use it to fetch the next page of results
          ScanIndexForward: false, // Sort by score descending
        })
        .promise();

      // Get all the game platform ids from the score items
      const gamePlatformIds = Items.reduce<string[]>((acc, item) => {
        if (!acc.includes(item.platformId)) {
          acc.push(item.platformId);
        }
        return acc;
      }, []);

      // Fetch the game platforms
      const games = await this.platformService.getPlatformsByIds(
        gamePlatformIds,
      );

      // Merge the game platforms with the score items
      const populatedScores = Items.map((item) => ({
        ...item,
        game: games.find((game) => game.id === item.platformId),
      }));

      // We return the lastEcvaluatedKey so the client can fetch the next page of results
      return {
        scores: populatedScores,
        lastEvaluatedKey: LastEvaluatedKey,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Couldn't get scores");
    }
  }

  /**
   * Saves a batch of scores.
   * We need to split the batch into groups of 100 items since the DynamoDB transaction write operation can't
   * manage more than 100 items.
   */
  async saveScores(scores: BatchScoreDto) {
    const unsavedScores = [];
    try {
      const groups = groupBy(scores.scores, this.BATCH_LIMIT);
      const allGroupedItems = await Promise.all(
        groups.map((group) =>
          this.saveGroupOfScores(
            scores.gamePartyId,
            scores.platformId,
            group,
          ).catch((e) => {
            // If there is an error, we add the unsaved scores to the unsavedScores array
            unsavedScores.push(...group);
            console.error(e);
          }),
        ),
      );

      if (unsavedScores.length > 0) {
        throw new InternalServerErrorException({
          unsavedScores,
          error: "Some score items couldn't be saved",
        });
      }

      return allGroupedItems.flat();
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException("Couldn't save scores");
    }
  }

  /**
   * Saves a group of max 100 score items
   */
  private async saveGroupOfScores(
    gamePartyId: string,
    platformId: string,
    scores: ScoreDto[],
  ) {
    const items = scores.map((score) => ({
      gamePartyId,
      platformId,
      userId: score.userId,
      score: score.score,
    }));

    await this.dynamoDB
      .transactWrite({
        TransactItems: items.map((item) => ({
          Put: {
            TableName: 'Scores',
            Item: item,
          },
        })),
      })
      .promise();
    return items;
  }
}
