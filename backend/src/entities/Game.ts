import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Ship } from "./Ship";
import { Shot } from "./Shot";

export enum GameStatus {
  WAITING_FOR_PLAYER = "WAITING_FOR_PLAYER",
  SHIPS_SETUP = "SETTING_UP_SHIPS",
  IN_PROGRESS = "PLAYING",
  FINISHED = "FINISHED",
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player1!: string;

  @Column({ nullable: true })
  player2!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  currentTurn!: string;

  @Column({ nullable: true })
  winner!: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  creationTimestamp!: Date;

  @Column({
    type: "enum",
    enum: GameStatus,
    default: GameStatus.WAITING_FOR_PLAYER,
  })
  status!: GameStatus;

  @OneToMany(() => Ship, (ship) => ship.game, { cascade: true })
  ships!: Ship[];

  @OneToMany(() => Shot, (shot) => shot.game, { cascade: true })
  shots!: Shot[];
}
