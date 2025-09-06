import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entities/Game";
import { Ship } from "./entities/Ship";
import { Shot } from "./entities/Shot";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "postgres",
  database: "battleship",
  synchronize: true,
  logging: false,
  entities: [Game, Ship, Shot],
});
