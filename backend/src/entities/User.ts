import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ default: 0 })
    totalGames!: number;

    @Column({ default: 0 })
    totalWins!: number;
}