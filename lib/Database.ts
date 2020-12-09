import { Pool } from 'pg';
import { logger } from './Logger';

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

export const pool = new Pool({
	ssl: { rejectUnauthorized: false },
	connectionString
});


export async function setup(): Promise<boolean> {
	logger.verbose("Setting up tables...");

	// Create post cache table.
	await pool.query(
		`CREATE TABLE IF NOT EXISTS post_cache (

		  game VARCHAR(16) NOT NULL,
		  seqn INT NOT NULL,
		  posted TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,

		  PRIMARY KEY(seqn, game)
		);`
	);
	logger.verbose("Done post_cache...");

	// Create discord channel subscriptions table.
	await pool.query(
		`CREATE TABLE IF NOT EXISTS discord_channels (

		  channel bigint NOT NULL,
		  game VARCHAR(16) NOT NULL,

		  PRIMARY KEY(channel, game)
		);`
	);
	logger.verbose("Done discord_channels...");

	return true;
}

export interface IPostCache {
	seqn: number,
	game: string,
	posted: Date
}

export interface IDiscordChannel {
	channel: string,
	game: string
}