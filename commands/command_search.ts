import { Client, Message, TextChannel } from 'eris';
import { CommandEvent } from '../interfaces/DEvent';
import { CacheSingleton } from '../lib/CacheSingleton';
import { ErrorMessage } from '../lib/Responses';
import { Paginator } from '../plugins/plugin_paginator';
import { Page, PageCommand } from '../structures/PageCommand';

const PAGE_SIZE = 10;

class SearchGame extends PageCommand {

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

		(e.plugins.pagination as Paginator).create(this, msg.author.id, msg.channel.id, 0, { query: game });
	}

	// Page is 0-index based
	async paginate(author: string, channel: string, page: number, searchQuery: any): Promise<Page> {

		const summary = (await this.cache.summary()).data.filter(s => s.flags == 'versions');

		const searchResults = summary.filter(sum => {
			if (sum.product.toLowerCase().includes(searchQuery.query))
				return true;

			if (searchQuery.query.includes(sum.product.toLowerCase()))
				return true;

			if (sum.name.toLowerCase().includes(searchQuery.query))
				return true;

			if (searchQuery.query.includes(sum.name.toLowerCase()))
				return true;

			return false;
		});

		if (searchResults.length == 0)
			return {
				hasNext: false,
				hasPrevious: false,
				currentPage: page,
				content: ErrorMessage("No games found with that search query.", "Searching games")
			}

		const lastPage = Math.floor(searchResults.length / PAGE_SIZE);
		return {
			hasNext: page < lastPage,
			hasPrevious: page != 0,
			currentPage: page,
			content: {
				content: '', embed: {
					title: `${searchResults.length} games found!`,
					description: `Your search resulted in **${searchResults.length}** games!\n\n` +
						searchResults.splice(page * PAGE_SIZE, PAGE_SIZE).map(game => `${game.name} - \`${game.product}\``).join('\n'),
					color: 0x01aeff,
					footer: {
						text: `Page [${page + 1} / ${lastPage + 1}]`
					}
				}
			}
		}

	}


}

module.exports = (new SearchGame());