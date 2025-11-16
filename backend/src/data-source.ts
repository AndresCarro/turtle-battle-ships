import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GamePostgres } from './entities/postgres/Game';
import { User } from './entities/postgres/User';
import { GameReplayPostgres } from './entities/postgres/GameReplay';
import { Friendship } from './entities/postgres/Friendship';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [GamePostgres, User, GameReplayPostgres, Friendship],
});
