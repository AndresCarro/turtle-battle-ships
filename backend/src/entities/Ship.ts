import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './Game';

export enum ShipType {
  CARRIER = 'CARRIER',
  DESTROYER = 'DESTROYER',
  BATTLESHIP = 'BATTLESHIP',
  SUBMARINE = 'SUBMARINE',
}

export function getShipTypeSize(shipType: ShipType): number {
  switch (shipType) {
    case ShipType.CARRIER:
      return 5;
    case ShipType.BATTLESHIP:
      return 4;
    case ShipType.SUBMARINE:
      return 3;
    case ShipType.DESTROYER:
      return 2;
    default:
      throw new Error(`Unknown ship type: ${shipType}`);
  }
}

export enum Orientation {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
}

export type ShipCreationDTO = {
  type: ShipType;
  x: number;
  y: number;
  orientation: Orientation;
};

@Entity()
export class Ship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  player!: string;

  @Column({ type: 'enum', enum: ShipType })
  type!: ShipType;

  @Column()
  x!: number;

  @Column()
  y!: number;

  @Column({ type: 'enum', enum: Orientation })
  orientation!: Orientation;

  @Column()
  length!: number;

  @Column()
  gameId!: number;

  @ManyToOne(() => Game, (game) => game.ships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game!: Game;
}
