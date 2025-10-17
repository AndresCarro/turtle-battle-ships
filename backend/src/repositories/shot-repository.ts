import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Shot } from '../models/Shot';
import { dynamo, TABLE_NAMES } from '../dynamo-client';
import { ShotMapper } from '../entities/dynamo/Shot';

export class ShotRepository {
  private readonly tableName = TABLE_NAMES;

  async create(shot: Shot): Promise<void> {
    const item = ShotMapper.toDynamo(shot);
    await dynamo.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );
  }

  async getByGameId(gameId: number): Promise<Shot[]> {
    const res = await dynamo.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `game:${gameId}:shot`,
        },
      })
    );

    return (res.Items ?? []).map((i) => ShotMapper.fromDynamo(i as any));
  }
}
