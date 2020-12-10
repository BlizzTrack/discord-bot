import { Pool } from 'pg';
import { logger } from './Logger';

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

export const pool = new Pool({
	connectionString
});


export async function setup(): Promise<boolean> {
	logger.verbose("Setting up tables...");


	await pool.query(
		`CREATE TABLE IF NOT EXISTS post_cache (
		
			game VARCHAR(16) NOT NULL,
			seqn INT NOT NULL,
			posted TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,

			PRIMARY KEY(seqn, game)
		);`
	);
	logger.verbose("Done post_cache...");


	await pool.query(
		`CREATE TABLE IF NOT EXISTS discord_channels (

			channel BIGINT NOT NULL,
			game VARCHAR(16) NOT NULL,

			PRIMARY KEY(channel, game)
		);`
	);
	logger.verbose("Done discord_channels...");


	await pool.query(
		`CREATE TABLE IF NOT EXISTS bot_config (

			setting varchar(16) NOT NULL,
			value JSONB,
	
			PRIMARY KEY(setting)
		);`
	);

	try {
		await pool.query(`INSERT INTO bot_config(setting, value) VALUES($1, $2);`, ['db_version', { version: 1 }]);
	} catch (_) { }

	logger.verbose("Done bot_config...");

	return true;
}

export async function upgrade(): Promise<boolean> {
	logger.verbose("Starting database upgrade...");
	let query = await pool.query<IBotConfig>("SELECT * FROM bot_config WHERE setting=$1;", ['db_version']);
	let db_version = query.rows[0].value['version'];

	if (db_version == 1) {
		await pool.query(`
			ALTER TABLE discord_channels 
			ADD COLUMN enabled BOOLEAN DEFAULT TRUE,
			ADD COLUMN guild BIGINT NOT NULL;
		`);

		db_version++;
	}

	await pool.query("UPDATE bot_config SET value=$2 WHERE setting=$1", ['db_version', { version: db_version }]);

	return true;
}

export interface IPostCache {
	seqn: number,
	game: string,
	posted: Date
}

export interface IDiscordChannel {
	guild: string,
	channel: string,
	game: string,
	enabled: boolean
}

export interface IBotConfig {
	setting: string,
	value: any
}