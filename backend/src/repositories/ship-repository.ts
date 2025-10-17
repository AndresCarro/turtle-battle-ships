import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLE_NAMES } from '../dynamo-client';
import { Ship } from '../models/Ship';
import { ShipsMapper } from '../entities/dynamo/Ship';

export class ShipRepository {
  private readonly tableName = TABLE_NAMES;

  async saveAll(gameId: number, player: string, ships: Ship[]): Promise<void> {
    const item = ShipsMapper.toDynamo(gameId, player, ships);
    await dynamo.send(
      new PutCommand({ TableName: this.tableName, Item: item })
    );
  }

  async getByGameAndPlayer(
    gameId: number,
    player: string
  ): Promise<Ship[] | null> {
    const PK = `game:${gameId}:ships:`;
    const SK = `user:${player}`;
    const res = await dynamo.send(
      new GetCommand({ TableName: this.tableName, Key: { PK, SK } })
    );
    if (!res.Item) return null;
    return ShipsMapper.fromDynamo(res.Item);
  }
}
