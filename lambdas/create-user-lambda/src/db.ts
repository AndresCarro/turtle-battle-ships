import { Pool, PoolClient } from "pg";
import { User } from "./types";

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
 * Create a new user in the PostgreSQL database
 */
export async function createUser(username: string): Promise<User> {
  const client: PoolClient = await getPool().connect();
  try {
    // Use an explicit transaction so the lookup and possible insert are atomic.
    await client.query("BEGIN");
    try {
      // Try to find existing user (locking the row if present to avoid races)
      const selectQuery = `
        SELECT id, name, "totalGames", "totalWins"
        FROM "user"
        WHERE name = $1
        FOR UPDATE
      `;

      const selectResult = await client.query(selectQuery, [username]);
      if (selectResult && selectResult.rowCount && selectResult.rowCount > 0) {
        const existing = selectResult.rows[0];
        await client.query("COMMIT");
        return {
          id: existing.id,
          name: existing.name,
          totalGames: existing.totalGames,
          totalWins: existing.totalWins,
        };
      }

      // Not found — insert new user
      const insertQuery = `
        INSERT INTO "user" (name, "totalGames", "totalWins")
        VALUES ($1, $2, $3)
        RETURNING id, name, "totalGames", "totalWins"
      `;

      const insertResult = await client.query(insertQuery, [username, 0, 0]);
      const newUser = insertResult.rows[0];

      await client.query("COMMIT");
      return {
        id: newUser.id,
        name: newUser.name,
        totalGames: newUser.totalGames,
        totalWins: newUser.totalWins,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
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
