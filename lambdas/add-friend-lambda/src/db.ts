import { Pool, PoolClient } from 'pg';
import { AddFriendRequest, FriendshipRecord } from './types';

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
      max: 1, // Lambda functions should use minimal connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function addFriend(request: AddFriendRequest): Promise<FriendshipRecord> {
  const { userName, friendName } = request;

  if (userName === friendName) {
    throw new Error('Cannot add yourself as a friend');
  }

  const client: PoolClient = await getPool().connect();
  try {
    const usersExist = await client.query(
      'SELECT name FROM "user" WHERE name IN ($1, $2)',
      [userName, friendName]
    );

    if (usersExist.rows.length !== 2) {
      throw new Error('One or both users do not exist');
    }

    const existingFriendship = await client.query(
      'SELECT * FROM friendships WHERE user_name = $1 AND friend_name = $2',
      [userName, friendName]
    );

    if (existingFriendship.rows.length > 0) {
      return existingFriendship.rows[0];
    }

    const result = await client.query(
      `INSERT INTO friendships (user_name, friend_name, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [userName, friendName]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}