import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game";

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

  @Column()
  hit!: boolean;

  @ManyToOne(() => Game, (game) => game.shots)
  game!: Game;
}
