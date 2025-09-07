import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entities/game";
import { Ship } from "./entities/ship";
import { Shot } from "./entities/shot";
import { User } from "./entities/user";

import "reflect-metadata";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Game, Ship, Shot, User],
});
