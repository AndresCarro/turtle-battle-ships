import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./Game";

@Entity()
export class Fleet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player!: string;

  @Column("json")
  ships!: any[];

  @ManyToOne(() => Game, (game) => game.fleets)
  game!: Game;
}
