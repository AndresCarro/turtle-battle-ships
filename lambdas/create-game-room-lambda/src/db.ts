import { Pool, PoolClient } from "pg";
import { CreateGameRoomRequest, Game } from "./types";

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
 * Create game room
 */
export async function createGameRoom(
  gameRoomToCreate: CreateGameRoomRequest
): Promise<Game> {
  const client: PoolClient = await getPool().connect();

  try {
    // Insert new game room into the game_postgres table
    const insertQuery = `
      INSERT INTO game_postgres (
        player1, 
        player2, 
        name, 
        "currentTurn", 
        winner, 
        "creationTimestamp", 
        status
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
      RETURNING 
        id, 
        player1, 
        player2, 
        name, 
        "currentTurn", 
        winner, 
        "creationTimestamp", 
        status
    `;

    const values = [
      gameRoomToCreate.username, // player1
      null, // player2
      gameRoomToCreate.gameRoomName, // name
      null, // currentTurn
      null, // winner
      "WAITING_FOR_PLAYER", // status
    ];

    const result = await client.query(insertQuery, values);
    const newGameRow = result.rows[0];

    // Map the database row to a Game object
    const newGame = new Game(
      newGameRow.id,
      newGameRow.player1,
      newGameRow.player2,
      newGameRow.name,
      newGameRow.currentTurn,
      newGameRow.winner,
      newGameRow.creationTimestamp,
      newGameRow.status,
      [], // ships
      [] // shots
    );

    return newGame;
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
