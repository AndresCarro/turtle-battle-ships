import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entities/Game";
import { Ship } from "./entities/Ship";
import { Shot } from "./entities/Shot";
import { User } from "./entities/User";

import "reflect-metadata";
import { GameReplay } from "./entities/game-replay";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  entities: [Game, Ship, Shot, User, GameReplay],
});
