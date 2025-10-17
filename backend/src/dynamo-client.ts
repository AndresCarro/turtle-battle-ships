import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'AKIAIDIDIDIDIDIDIDID',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  },
});

export const dynamoDoc = DynamoDBDocumentClient.from(client);

export const dynamo = client;

export const TABLE_NAMES = 'games-table';

export async function initTables() {
  try {
    await dynamo.send(
      new CreateTableCommand({
        TableName: TABLE_NAMES,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      })
    );

    console.log(`Tabla ${TABLE_NAMES} creada`);
  } catch (e: any) {
    if (e.name === 'ResourceInUseException') console.log('Tabla ya existe');
    else throw e;
  }
}
