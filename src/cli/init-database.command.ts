import { DynamoDB } from 'aws-sdk';
import { Command, CommandRunner } from 'nest-commander';
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';

@Command({
  name: 'init-database',
  description: 'Initialize the database',
})
export class InitDatabaseCommand extends CommandRunner {
  constructor(private readonly dynamoDB: DynamoDB) {
    super();
  }

  async run() {
    try {
      await this.createPlatformTable();
      await this.createScoreTable();
      console.log('Database initialized');
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Creates the Score table
   * The partition key is GamePartyId
   * The sort key is UserId
   *
   * There are secondary indexes to allow for specific querying
   * - There is a local secondary index on GamePartyId and Score
   * - There is a global secondary index on UserId and Score
   * - There is another global secondary index on PlatformId and Score
   */
  private async createScoreTable() {
    const ScoreTableMetaData: CreateTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'gamePartyId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'userId',
          AttributeType: 'S',
        },
        {
          AttributeName: 'score',
          AttributeType: 'N',
        },
        {
          AttributeName: 'platformId',
          AttributeType: 'S',
        },
      ],
      TableName: 'Scores',
      KeySchema: [
        {
          AttributeName: 'gamePartyId',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'userId',
          KeyType: 'RANGE',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 3,
        WriteCapacityUnits: 3,
      },

      LocalSecondaryIndexes: [
        {
          IndexName: 'ByScore',
          KeySchema: [
            {
              AttributeName: 'gamePartyId',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'score',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ByUserIdAndScore',
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'score',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        },
        {
          IndexName: 'ByPlatformIdAndScore',
          KeySchema: [
            {
              AttributeName: 'platformId',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'score',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        },
      ],
    };

    await this.dynamoDB.createTable(ScoreTableMetaData).promise();
  }

  /**
   * Creates the Platform table
   * The partition key is id
   * The sort key is name
   */
  private async createPlatformTable() {
    const PlatformTableMetaData: CreateTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      TableName: 'Platforms',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 3,
        WriteCapacityUnits: 3,
      },
    };

    await this.dynamoDB.createTable(PlatformTableMetaData).promise();
  }
}
