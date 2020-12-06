declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			POSTGRES_CONNECTION_STRING: string,
			NODE_ENV: string
		}
	}
}

export { }