import { ClientOptions } from "eris";


export interface BotConfig {
	prefix: string,
	ignoreBots: boolean,
	ignoreSelf: boolean,
	mainServer: string
}

export const CONFIG: { bot: BotConfig, eris: ClientOptions } = {
	bot: {
		prefix: 'bt!',
		ignoreBots: true,
		ignoreSelf: true,
		mainServer: '251192826782679051'
	},
	eris: {
		// Please look at the https://abal.moe/Eris/docs/Client constructor
		autoreconnect: true,
		compress: true,
		messageLimit: 1,
		intents: [
			"guilds",
			"guildMessages",
			"guildMessageReactions"
		]
	}
}