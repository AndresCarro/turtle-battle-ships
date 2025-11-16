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

export async function getFriendsList(username: string): Promise<User[]> {
  const client: PoolClient = await getPool().connect();

  try {
    const query = `
      SELECT f.id, f.user_id, f.friend_id, f.status, f.created_at, f.updated_at,
             friend.id as friend_id_pk, friend.name as friend_name, 
             friend.total_games, friend.total_wins
      FROM friendships f
      INNER JOIN "user" u ON f.user_id = u.id
      INNER JOIN "user" friend ON f.friend_id = friend.id
      WHERE u.name = $1 AND f.status = 'accepted'
      ORDER BY f.created_at DESC
    `;

    const result = await client.query(query, [username]);

    const friends: User[] = result.rows.map(
      (row) => ({
        id: row.friend_id_pk,
        name: row.friend_name,
        totalGames: row.total_games,
        totalWins: row.total_wins,
      })
    );

    return friends;
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
