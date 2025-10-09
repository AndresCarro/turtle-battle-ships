import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './Game';

export enum ShotSuccess {
  'miss',
  'hit',
  'sunk',
}

@Entity()
export class Shot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player!: string;

  @Column()
  x!: number;

  @Column()
  y!: number;

  @Column({ type: 'enum', enum: ShotSuccess })
  shotSuccess!: ShotSuccess;

  @ManyToOne(() => Game, (game) => game.shots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game!: Game;

  @Column()
  gameId!: number;
}
