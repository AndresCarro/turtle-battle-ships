import { AppDataSource } from '../data-source';
import { GameReplayPostgres } from '../entities/postgres/GameReplay';

export class GameReplayRepository {
  private repo = AppDataSource.getRepository(GameReplayPostgres);

  async save(replay: GameReplayPostgres): Promise<GameReplayPostgres> {
    return this.repo.save(replay);
  }

  async getByGameId(gameId: number): Promise<GameReplayPostgres | null> {
    return this.repo.findOne({
      where: {
        game: { id: gameId },
      },
      relations: ['game'],
    });
  }

  async listAll(): Promise<GameReplayPostgres[]> {
    return this.repo.find();
  }
}
