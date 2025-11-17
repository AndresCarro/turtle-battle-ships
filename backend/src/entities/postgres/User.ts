import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ default: 0 })
    totalGames!: number;

    @Column({ default: 0 })
    totalWins!: number;
}