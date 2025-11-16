import { AppDataSource } from './data-source';

/**
 * Initialize database tables if they don't exist
 * This runs before the main application starts
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database schema...');
  
  try {
    // Get the query runner
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if friendships table exists
    const friendshipsExists = await queryRunner.hasTable('friendships');
    
    if (!friendshipsExists) {
      console.log('📋 Creating friendships table...');
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS friendships (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          friend_id INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          
          CONSTRAINT fk_friendships_user_id FOREIGN KEY (user_id) 
            REFERENCES "user"(id) ON DELETE CASCADE,
          CONSTRAINT fk_friendships_friend_id FOREIGN KEY (friend_id) 
            REFERENCES "user"(id) ON DELETE CASCADE,
          CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
          CONSTRAINT check_friendship_status CHECK (status IN ('pending', 'accepted', 'blocked'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
        CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
        CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
        CREATE INDEX IF NOT EXISTS idx_friendships_user_friend ON friendships(user_id, friend_id);
      `);
      console.log('✅ Friendships table created successfully');
    } else {
      console.log('✅ Friendships table already exists');
    }

    await queryRunner.release();
    console.log('✅ Database schema initialization complete');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}
