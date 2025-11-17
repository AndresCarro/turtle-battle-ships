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
    await client.query("BEGIN");

    const userQuery = `SELECT id FROM "user" WHERE name = $1`;

    const currentUserRes = await client.query(userQuery, [currentUsername]);
    const userToDeleteRes = await client.query(userQuery, [usernameToDelete]);

    if (currentUserRes.rowCount === 0 || userToDeleteRes.rowCount === 0) {
      throw new Error("Friendship deletion failed: user not found");
    }

    const currentUserId = currentUserRes.rows[0].id;
    const deleteUserId = userToDeleteRes.rows[0].id;

    const friendshipQuery = `
      SELECT id 
      FROM friendships
      WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)
    `;

    const friendshipRes = await client.query(friendshipQuery, [
      currentUserId,
      deleteUserId,
    ]);

    if (friendshipRes.rowCount === 0) {
      throw new Error("Friendship deletion failed: user not found");
    }

    const deleteQuery = `
      DELETE FROM friendships
      WHERE (user_id = $1 AND friend_id = $2)
         OR (user_id = $2 AND friend_id = $1)
    `;

    await client.query(deleteQuery, [currentUserId, deleteUserId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
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
