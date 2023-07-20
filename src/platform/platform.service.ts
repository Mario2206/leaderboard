import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PlatformDto } from './dto/platform.dto';
import { randomUUID } from 'crypto';
import { groupBy } from 'src/utils/groupBy';

@Injectable()
export class PlatformService {
  private BATCH_LIMIT = 100;

  constructor(private readonly dynamoDB: DocumentClient) {}

  async registerPlatform(body: PlatformDto) {
    try {
      const platform = { ...body, id: randomUUID() };
      await this.dynamoDB
        .put({
          TableName: 'Platforms',
          Item: platform,
        })
        .promise();
      return platform;
    } catch (error) {
      throw new InternalServerErrorException("Couldn't register platform");
    }
  }

  async getPlatformsByIds(ids: string[]) {
    try {
      // I need to fetch the platforms in batches because the batchGet operation has a limit of 100 items
      const groups = groupBy(ids, this.BATCH_LIMIT);
      const promises = groups.map(async (group) => {
        const { Responses } = await this.dynamoDB
          .batchGet({
            RequestItems: {
              Platforms: {
                Keys: group.map((id) => ({ id })),
              },
            },
          })
          .promise();

        return Responses.Platforms;
      });

      return (await Promise.all(promises)).flat();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Couldn't get platforms");
    }
  }
}
