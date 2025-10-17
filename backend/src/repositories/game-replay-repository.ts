import { AppDataSource } from '../data-source';
import { GameReplayPostgres } from '../entities/postgres/GameReplay';

export class GameReplayRepository {
  private repo = AppDataSource.getRepository(GameReplayPostgres);

  async save(replay: GameReplayPostgres): Promise<GameReplayPostgres> {
    return this.repo.save(replay);
  }

  async getById(id: number): Promise<GameReplayPostgres | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listAll(): Promise<GameReplayPostgres[]> {
    return this.repo.find();
  }
}
