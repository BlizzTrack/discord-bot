import { Client, Constants, Message, Permission, TextChannel } from 'eris';
import { SummaryItem } from '../interfaces/API';
import { CommandEvent } from '../interfaces/DEvent';
import { CacheSingleton } from '../lib/CacheSingleton';
import { DiscordChannel } from '../lib/Database';
import { ErrorMessage } from '../lib/Responses';
import { Paginator } from '../plugins/plugin_paginator';
import { Page, PageCommand } from '../structures/PageCommand';

const PAGE_SIZE = 10;
class ClearSubs extends PageCommand {

	private cache: CacheSingleton;

	constructor() {
		super('listsubscriptions', {
			aliases: ['listsubs', 'listsub', 'list'],
			category: 'BlizzTrack',
			syntax: "{name}"
		});
		this.cache = CacheSingleton.instance;
	}

	get permissions(): Permission {
		return new Permission(Constants.Permissions.manageWebhooks, 0);
	}

	get description(): string {
		return "List all games you're currently subscribed to.";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		let page = 0;
		if (e.args[0] && /^[0-9]$/.test(e.args[0]))
			page = parseInt(e.args[0]) - 1;

		(e.plugins.pagination as Paginator).create(this, msg.author.id, msg.channel.id, 0);
	}

	// Page is 0-index based
	async paginate(author: string, channel: string, page: number): Promise<Page> {
		const settings = await DiscordChannel.findAndCountAll({ where: { channel: channel }, offset: page * PAGE_SIZE, limit: PAGE_SIZE });
		const summary = (await this.cache.summary()).data.filter(s => s.flags == 'versions');

		let games: SummaryItem[] = [];

		// Could've used map, but TS was being a bitch.
		for (let subbed of settings.rows) {
			let found = summary.find(sum => sum.product == subbed.game);
			if (found)
				games.push(found);
		}

		if (settings.count == 0)
			return {
				hasNext: false,
				hasPrevious: false,
				currentPage: page,
				content: ErrorMessage("You're not subscribed to any games.", "Listing subscriptions")
			}

		const lastPage = Math.floor(settings.count / PAGE_SIZE);
		return {
			hasNext: page < lastPage,
			hasPrevious: page != 0,
			currentPage: page,
			content: {
				content: '', embed: {
					title: "Listing subscriptions",
					description: `You're subscribed to **${settings.count}** games\n\n` +
						games.map(game => `${game.name} - \`${game.product}\``).join('\n'),
					color: 0x01aeff,
					footer: {
						text: `Page [${page + 1} / ${lastPage + 1}]`
					}
				}
			}
		}

	}
}

module.exports = (new ClearSubs());