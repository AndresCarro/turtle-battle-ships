DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gamestatuspostgres') THEN
    CREATE TYPE GameStatusPostgres AS ENUM (
      'WAITING_FOR_PLAYER',
      'SETTING_UP_SHIPS',
      'PLAYING',
      'FINISHED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "game_postgres" (
    id SERIAL PRIMARY KEY,
    player1 VARCHAR(255) NOT NULL,
    player2 VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    "currentTurn" VARCHAR(255) NULL,
    winner VARCHAR(255) NULL,
    "creationTimestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    status GameStatusPostgres NOT NULL DEFAULT 'WAITING_FOR_PLAYER'
);

CREATE TABLE IF NOT EXISTS "game_replay_postgres" (
    id SERIAL PRIMARY KEY,
    "gameId" INTEGER NOT NULL,
    "s3Key" VARCHAR(255) NOT NULL,
    CONSTRAINT fk_game
      FOREIGN KEY("gameId")
      REFERENCES game_postgres(id)
      ON DELETE CASCADE
);
