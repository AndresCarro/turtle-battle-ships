import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Use different configuration based on environment
const isProduction = process.env.NODE_ENV === 'production';
const region = process.env.DYNAMO_REGION || process.env.REGION || 'us-east-1';
const tableName = process.env.DYNAMO_TABLE_NAME || 'games-table';

const dynamoConfig: any = {
  region,
};

// Only use custom endpoint and credentials in local development
if (!isProduction && process.env.DYNAMO_ENDPOINT) {
  dynamoConfig.endpoint = process.env.DYNAMO_ENDPOINT;
  dynamoConfig.credentials = {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID || 'AKIAIDIDIDIDIDIDIDID',
    secretAccessKey:
      process.env.DYNAMO_SECRET_ACCESS_KEY ||
      'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  };
}

const client = new DynamoDBClient(dynamoConfig);

export const dynamo = client;
export const dynamoDoc = DynamoDBDocumentClient.from(client);
export const TABLE_NAMES = tableName;

export async function initTables() {
  // Skip table creation in production (table should be managed by Terraform)
  if (isProduction) {
    console.log(
      `ℹ️  Production mode: Skipping table creation. Table ${TABLE_NAMES} should be managed by Terraform.`
    );
    return;
  }

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
