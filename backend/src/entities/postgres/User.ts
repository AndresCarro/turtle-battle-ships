import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'total_games', default: 0 })
    totalGames!: number;

    @Column({ name: 'total_wins', default: 0 })
    totalWins!: number;
}