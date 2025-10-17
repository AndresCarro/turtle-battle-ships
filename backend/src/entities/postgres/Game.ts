import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Game, GameStatus } from '../../models/Game';

export enum GameStatusPostgres {
  WAITING_FOR_PLAYER = 'WAITING_FOR_PLAYER',
  SHIPS_SETUP = 'SETTING_UP_SHIPS',
  IN_PROGRESS = 'PLAYING',
  FINISHED = 'FINISHED',
}

@Entity()
export class GamePostgres {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player1!: string;

  @Column({ type: 'varchar', nullable: true })
  player2: string | null = null;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  currentTurn: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  winner: string | null = null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  creationTimestamp!: Date;

  @Column({
    type: 'enum',
    enum: GameStatusPostgres,
    default: GameStatusPostgres.WAITING_FOR_PLAYER,
  })
  status!: GameStatusPostgres;

  static toDomain(
    entity: GamePostgres,
    ships: any[] = [],
    shots: any[] = []
  ): Game {
    return new Game(
      entity.id,
      entity.player1,
      entity.player2 ?? undefined,
      entity.name,
      entity.currentTurn ?? undefined,
      entity.winner ?? undefined,
      entity.creationTimestamp,
      GamePostgres.mapStatusToDomain(entity.status),
      ships,
      shots
    );
  }

  static fromDomain(domain: Game): GamePostgres {
    const entity = new GamePostgres();
    entity.id = domain.id;
    entity.player1 = domain.player1;
    entity.player2 = domain.player2 ?? null;
    entity.name = domain.name ?? '';
    entity.currentTurn = domain.currentTurn ?? null;
    entity.winner = domain.winner ?? null;
    entity.creationTimestamp = domain.creationTimestamp ?? new Date();
    entity.status = GamePostgres.mapStatusToPostgres(domain.status);
    return entity;
  }

  public static mapStatusToDomain(status: GameStatusPostgres): GameStatus {
    switch (status) {
      case GameStatusPostgres.WAITING_FOR_PLAYER:
        return GameStatus.WAITING_FOR_PLAYER;
      case GameStatusPostgres.SHIPS_SETUP:
        return GameStatus.SHIPS_SETUP;
      case GameStatusPostgres.IN_PROGRESS:
        return GameStatus.IN_PROGRESS;
      case GameStatusPostgres.FINISHED:
        return GameStatus.FINISHED;
    }
  }

  public static mapStatusToPostgres(status: GameStatus): GameStatusPostgres {
    switch (status) {
      case GameStatus.WAITING_FOR_PLAYER:
        return GameStatusPostgres.WAITING_FOR_PLAYER;
      case GameStatus.SHIPS_SETUP:
        return GameStatusPostgres.SHIPS_SETUP;
      case GameStatus.IN_PROGRESS:
        return GameStatusPostgres.IN_PROGRESS;
      case GameStatus.FINISHED:
        return GameStatusPostgres.FINISHED;
    }
  }
}
