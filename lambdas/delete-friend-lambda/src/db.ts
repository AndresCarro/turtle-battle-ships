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

export async function deleteFriendship(
  currentUsername: string,
  usernameToDelete: string
): Promise<void> {
  const client: PoolClient = await getPool().connect();

  try {
    const deleteQuery = `
      DELETE FROM friendships
      WHERE (user_name = $1 AND friend_name = $2)
    `;
    await client.query(deleteQuery, [currentUsername, usernameToDelete]);
  } catch (error) {
    throw error;
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
