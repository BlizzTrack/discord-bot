import { Client, Message, TextChannel } from 'eris';
import { CommandEvent } from '../interfaces/DEvent';
import { CacheSingleton } from '../lib/CacheSingleton';
import { ErrorMessage } from '../lib/Responses';
import { Command } from '../structures/Command';

class SearchGame extends Command {

	private cache: CacheSingleton;

	constructor() {
		super('search', {
			category: 'BlizzTrack',
			syntax: "{name} <query>"
		});
		this.cache = CacheSingleton.instance;
	}

	get description(): string {
		return "Search for games that have been indexed by BlizzTrack.";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		const game = e.args.join(" ").toLowerCase();

		if (!game || game.length < 2)
			return msg.channel.createMessage(ErrorMessage(`Please enter at least 2 characters to search.`));

		const summary = (await this.cache.summary()).data.filter(s => s.flags == 'versions');


		const searchResults = summary.filter(sum => {
			if (sum.product.toLowerCase().includes(game))
				return true;

			if (game.includes(sum.product.toLowerCase()))
				return true;

			if (sum.name.toLowerCase().includes(game))
				return true;

			if (game.includes(sum.name.toLowerCase()))
				return true;

			return false;
		});


		if (searchResults.length == 0)
			return msg.channel.createMessage(ErrorMessage(`No games found with that search query.`));

		msg.channel.createMessage({
			content: '', embed: {
				title: `${searchResults.length || "No"} games found!`,
				description: `Your search resulted in ${searchResults.length || "No"} results!\n\n` +
					searchResults.map(game => `${game.name} - \`${game.product}\``).join('\n'),
				color: 0x01aeff
			}
		});

	}
}

module.exports = (new SearchGame());