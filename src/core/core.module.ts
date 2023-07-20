import { Global, Module, Provider } from '@nestjs/common';
import { DynamoDBClientFactory, DynamoDBFactory } from './dynamo.database';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

const DynamoDBClientProvider: Provider = {
  inject: [ConfigService],
  provide: AWS.DynamoDB.DocumentClient,
  useFactory: DynamoDBClientFactory,
};

const DynamoDBProvider: Provider = {
  inject: [ConfigService],
  provide: AWS.DynamoDB,
  useFactory: DynamoDBFactory,
};

@Global()
@Module({
  providers: [DynamoDBClientProvider, DynamoDBProvider],
  exports: [DynamoDBClientProvider, DynamoDBProvider],
})
export class CoreModule {}
