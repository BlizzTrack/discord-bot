declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			POSTGRES_CONNECTION_STRING: string;
			NODE_ENV: string;
			USE_BETA_URL: boolean;
			API_USE_BETA_URL: boolean;
		}
	}
}

export { }