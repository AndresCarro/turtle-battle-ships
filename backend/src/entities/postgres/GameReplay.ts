import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GamePostgres } from './Game';

@Entity()
export class GameReplayPostgres {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GamePostgres, { nullable: false })
  @JoinColumn({ name: 'gameId' })
  game!: GamePostgres;

  @Column()
  s3Key!: string;
}
