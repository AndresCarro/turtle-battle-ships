import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Fleet } from "./Fleet";
import { Shot } from "./Shot";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player1!: string;

  @Column({ nullable: true })
  player2!: string;

  @Column()
  status!: string;

  @OneToMany(() => Fleet, (fleet) => fleet.game)
  fleets!: Fleet[];

  @OneToMany(() => Shot, (shot) => shot.game)
  shots!: Shot[];
}
