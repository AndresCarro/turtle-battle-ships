import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Game } from "./Game";

@Entity()
export class GameReplay {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Game, { nullable: false })
  @JoinColumn({ name: "gameId" })
  game!: Game;

  @Column()
  s3Key!: string;
}
