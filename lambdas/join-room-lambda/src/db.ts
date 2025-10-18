import { Pool, PoolClient } from "pg";
import { Game, GameStatus } from "./types";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function joinRoom(
  gameId: number,
  username: string
): Promise<Game> {
  const client: PoolClient = await getPool().connect();

  try {
    await client.query("BEGIN");

    const gameResult = await client.query(
      `SELECT * FROM game WHERE id = $1 FOR UPDATE`,
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      throw new Error("Game not found");
    }

    const game = gameResult.rows[0];

    if (game.player2) {
      throw new Error("Game already has two players");
    }

    const updatedGame = await client.query(
      `
      UPDATE game
      SET player2 = $1,
          status = $2,
          "currentTurn" = player1
      WHERE id = $3
      RETURNING id, name, player1, player2, status, "currentTurn", winner, "creationTimestamp"
    `,
      [username, GameStatus.SHIPS_SETUP, gameId]
    );

    await client.query("COMMIT");

    const row = updatedGame.rows[0];
    return new Game(
      row.id,
      row.player1,
      row.player2,
      row.name,
      row.currentTurn,
      row.winner,
      row.creationTimestamp,
      row.status
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
