import { Pool, PoolClient } from 'pg';
import { AddFriendRequest, FriendshipRecord } from './types';
import { get } from 'http';

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
  const { userId, friendId } = request;

  if (userId === friendId) {
    throw new Error('Cannot add yourself as a friend');
  }

  const client: PoolClient = await getPool().connect();
  try {
    const usersExist = await client.query(
      'SELECT id FROM "user" WHERE id IN ($1, $2)',
      [userId, friendId]
    );

    if (usersExist.rows.length !== 2) {
      throw new Error('One or both users do not exist');
    }

    const existingFriendship = await client.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      if (friendship.status === 'pending') {
        throw new Error('Friend request already pending');
      } else if (friendship.status === 'accepted') {
        throw new Error('Users are already friends');
      } else if (friendship.status === 'blocked') {
        throw new Error('Cannot add friend - relationship blocked');
      }
    }

    const result = await client.query(
      `INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
       VALUES ($1, $2, 'pending', NOW(), NOW())
       RETURNING *`,
      [userId, friendId]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}