import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Game } from "./game";

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
