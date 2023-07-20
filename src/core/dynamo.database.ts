import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

const getParams = (configService: ConfigService) => {
  return configService.get('NODE_ENV') === 'development'
    ? {
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT,
      }
    : {};
};

export const DynamoDBClientFactory = (configService: ConfigService) => {
  return new AWS.DynamoDB.DocumentClient(getParams(configService));
};

export const DynamoDBFactory = (configService: ConfigService) => {
  return new AWS.DynamoDB(getParams(configService));
};
