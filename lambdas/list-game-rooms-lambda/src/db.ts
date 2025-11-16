import { Pool, PoolClient } from "pg";
import { Game } from "./types";

// Create a connection pool for PostgreSQL
let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 */
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
      max: 1, // Lambda functions should use minimal connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

/**
 * Get all game rooms from the PostgreSQL database
 */
export async function getGameRooms(): Promise<Game[]> {
  const client: PoolClient = await getPool().connect();

  try {
    // Query to fetch all games from the game_postgres table
    const query = `
      SELECT
        gp.id,
        gp.player1,
        gp.player2,
        gp.name,
        gp."currentTurn",
        gp.winner,
        gp."creationTimestamp",
        gp.status,
        replay."s3Key" AS "s3Key"
      FROM game_postgres gp
      LEFT JOIN LATERAL (
        SELECT "s3Key" FROM game_replay_postgres WHERE "gameId" = gp.id LIMIT 1
      ) replay ON TRUE
      ORDER BY gp."creationTimestamp" DESC
    `;

    const result = await client.query(query);

    // Map the database rows to Game objects
    const games: Game[] = result.rows.map(
      (row) =>
        new Game(
          row.id,
          row.player1,
          row.player2,
          row.name,
          row.currentTurn,
          row.winner,
          row.creationTimestamp,
          row.status,
          [], // ships - empty
          [], // shots - empty
          row.s3Key
        )
    );

    return games;
  } finally {
    client.release();
  }
}

/**
 * Close the database pool (useful for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
