import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { s3 } from '../data-s3-client';
import { GameReplayPostgres } from '../entities/postgres/GameReplay';
import { GameReplayRepository } from '../repositories/game-replay-repository';
import { GamePostgres } from '../entities/postgres/Game';
import { getGameService } from './games-service';

const replayRepo = new GameReplayRepository();

export const saveGameReplay = async (gameId: number) => {
  const game = await getGameService(gameId);
  if (!game) throw new Error(`Game ${gameId} no encontrado`);

  const gameJson = JSON.stringify(game, null, 2);
  const fileKey = `replays/${randomUUID()}.json`;

  await s3.send(
    new PutObjectCommand({
      Bucket: 'game-replays',
      Key: fileKey,
      Body: gameJson,
      ContentType: 'application/json',
    })
  );

  const replayEntity = new GameReplayPostgres();
  replayEntity.game = GamePostgres.fromDomain(game);
  replayEntity.s3Key = fileKey;

  const replay = await replayRepo.save(replayEntity);

  return replay;
};
