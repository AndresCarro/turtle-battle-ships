import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Shot, ShotSuccess } from '../models/Shot';
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

  async updateShotSuccess(
    gameId: number,
    shotId: number,
    shotSuccess: ShotSuccess
  ): Promise<void> {
    const PK = `game:${gameId}:shot`;
    const SK = `${shotId}`;

    await dynamo.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { PK, SK },
        UpdateExpression: 'SET #shotSuccess = :shotSuccess',
        ExpressionAttributeNames: {
          '#shotSuccess': 'shotSuccess',
        },
        ExpressionAttributeValues: {
          ':shotSuccess': shotSuccess,
        },
      })
    );
  }
}
