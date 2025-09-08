import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { s3 } from "../data-s3-client";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { GameReplay } from "../entities/game-replay";

const replayRepository = AppDataSource.getRepository(GameReplay);
const gameRepository = AppDataSource.getRepository(Game);

export const saveGameReplay = async (gameId: number) => {
  const game = await gameRepository.findOne({
    where: { id: gameId },
    relations: ["ships", "shots"],
  });

  if (!game) throw new Error(`Game ${gameId} no encontrado`);

  const gameJson = JSON.stringify(game, null, 2);
  const fileKey = `replays/${randomUUID()}.json`;

  await s3.send(
    new PutObjectCommand({
      Bucket: "game-replays",
      Key: fileKey,
      Body: gameJson,
      ContentType: "application/json",
    })
  );

  const replay = replayRepository.create({
    game: game,
    s3Key: fileKey,
  });

  await replayRepository.save(replay);

  return replay;
};
