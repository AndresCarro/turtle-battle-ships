import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./Game";

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

  @ManyToOne(() => Game, (game) => game.shots, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gameId" })
  game!: Game;

  @Column()
  gameId!: number;
}
