import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.DYNAMO_REGION || 'us-east-1';
const endpoint =
  process.env.DYNAMO_ENDPOINT ||
  `http://localhost:${process.env.DYNAMO_PORT || 8000}`;
const accessKeyId = process.env.DYNAMO_ACCESS_KEY_ID || 'AKIAIDIDIDIDIDIDIDID';
const secretAccessKey =
  process.env.DYNAMO_SECRET_ACCESS_KEY ||
  'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const tableName = process.env.DYNAMO_TABLE_NAME || 'games-table';

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const dynamo = client;
export const dynamoDoc = DynamoDBDocumentClient.from(client);
export const TABLE_NAMES = tableName;

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
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
    );

    console.log(`✅ Tabla ${TABLE_NAMES} creada`);
  } catch (e: any) {
    if (e.name === 'ResourceInUseException') {
      console.log(`ℹ️  Tabla ${TABLE_NAMES} ya existe`);
    } else {
      console.error('❌ Error creando tabla:', e);
      throw e;
    }
  }
}
