import { AppDataSource } from '../data-source';
import { GamePostgres, GameStatusPostgres } from '../entities/postgres/Game';
import { Game, GameStatus } from '../models/Game';

export class GameRepository {
  private repo = AppDataSource.getRepository(GamePostgres);

  async createGame(player1: string, name: string): Promise<Game> {
    const gameEntity = this.repo.create({ player1, name });
    const saved = await this.repo.save(gameEntity);
    return GamePostgres.toDomain(saved);
  }

  async joinGame(id: number, username: string): Promise<Game> {
    const game = await this.repo.findOne({ where: { id } });
    if (!game) throw new Error('Game not found');
    if (game.player2) throw new Error('Game already has two players');

    game.player2 = username;
    game.status = GameStatusPostgres.SHIPS_SETUP;
    game.currentTurn = game.player1;
    const saved = await this.repo.save(game);
    return GamePostgres.toDomain(saved);
  }

  async listGames(): Promise<Game[]> {
    const games = await this.repo.find();
    return games.map((g) => GamePostgres.toDomain(g));
  }

  async getGame(id: number): Promise<Game> {
    const game = await this.repo.findOne({ where: { id } });
    if (!game) throw new Error('Game not found');
    return GamePostgres.toDomain(game);
  }

  async updateStatus(id: number, status: GameStatus, winner?: string) {
    const gameStatus = GamePostgres.mapStatusToPostgres(status);
    await this.repo.update(id, { status: gameStatus, winner: winner ?? null });
  }

  async updateTurn(id: number, currentTurn: string) {
    await this.repo.update(id, { currentTurn });
  }

  async finishGame(id: number, winner: string) {
    await this.repo.update(id, { status: GameStatusPostgres.FINISHED, winner });
  }
}
