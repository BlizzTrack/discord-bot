import { Client, Constants, DiscordRESTError, Message, Permission, TextChannel } from 'eris';
import { CONFIG } from '../config';
import { ALIASES } from '../Constants';
import { CommandEvent } from '../interfaces/DEvent';
import { CacheSingleton } from '../lib/CacheSingleton';
import { DiscordChannel } from '../lib/Database';
import { ErrorMessage, OKMessage } from '../lib/Responses';
import { Command } from '../structures/Command';

class VersionUnSubscribe extends Command {

	private cache: CacheSingleton;

	constructor() {
		super('unsubscribe', {
			aliases: ['unsub'],
			category: 'BlizzTrack',
			syntax: "{name} <game>"
		});
		this.cache = CacheSingleton.instance;
	}

	get permissions(): Permission {
		return new Permission(Constants.Permissions.manageWebhooks, 0);
	}

	get description(): string {
		return "Unsubscribe from a game. Unsubscribing from a game will **stop** posting messages whenever a new version is found.";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		let game = e.args.join(" ").toLowerCase();
		if (!game) return msg.channel.createMessage(ErrorMessage("You forgot to tell me which game to unsubscribe from!"));

		const settings = await DiscordChannel.findAll({ where: { channel: msg.channel.id } }); // await pool.query<IDiscordChannel>("SELECT * FROM discord_channels WHERE channel=$1", [msg.channel.id]);

		const summary = (await this.cache.summary()).data.filter(s => s.flags == 'versions').filter(g => settings.find(r => r.game == g.product));
		let sumGame = summary.find(sum => game == sum.name.toLowerCase() || game == sum.product.toLowerCase());

		if (!sumGame)
			if (game in ALIASES)
				sumGame = summary.find(sum => ALIASES[game] == sum.product.toLowerCase());

		if (['*', 'all'].includes(game)) {
			const hasAllSubscription = settings.find(set => set.game == '*' && set.enabled);
			if (hasAllSubscription) return msg.channel.createMessage(OKMessage(`You are not subscribed to **all games**! (If you want to clear your subscriptions, use \`${CONFIG.bot.prefix}clearsubs\`)`));

			await DiscordChannel.destroy({
				where: {
					guild: msg.channel.guild.id,
					channel: msg.channel.id,
					game: '*'
				}
			});
			// await pool.query("DELETE FROM discord_channels WHERE guild=$1 AND channel=$2 AND game=$3", [msg.channel.guild.id, msg.channel.id, '*']);
			return msg.channel.createMessage(OKMessage(`Successfully unsubscribed from **all games**!`));
		}

		// Early exit if exact match.
		if (sumGame) {
			const curGame = settings.find(set => set.game == sumGame?.product && set.enabled);
			if (curGame) {
				const upsetState = await this.cache.upsertSubscription(msg.channel.guild.id, msg.channel.id, sumGame.product, false);
				return msg.channel.createMessage(OKMessage(`Removed subscription from **${sumGame.name}**!`));
			}
		}

		if (game.length < 2)
			return msg.channel.createMessage(ErrorMessage(`Please enter at least 2 characters to search.`));

		// Continue a 'more advanced' search
		let sumGames = summary.filter(sum => {
			if (sum.name.toLowerCase().includes(game))
				return true;

			if (game.includes(sum.name.toLowerCase()))
				return true;

			return false;
		});

		if (sumGames.length == 0)
			return msg.channel.createMessage(ErrorMessage(`No games you're subscribed to found with that search query.`));

		if (sumGames.length == 1) {
			const curGame = settings.find(set => set.game == sumGames[0]?.product && set.enabled);
			if (curGame) {
				const upsetState = await this.cache.upsertSubscription(msg.channel.guild.id, msg.channel.id, sumGames[0]?.product, false);
				return msg.channel.createMessage(OKMessage(`Removed subscription from **${sumGames[0]?.name}**!`));
			}
		}

		msg.channel.createMessage({
			content: '', embed: {
				title: "Multiple games found!",
				description: "Your search resulted in multiple games with similar names!\nPlease choose one by using its shortname.\n\n" +
					sumGames.map(game => `${game.name} - \`${game.product}\``).join('\n'),
				color: 0x01aeff
			}
		}).catch((err: DiscordRESTError) => {
			if (err.code == 50035) { // Invalid Form Body
				msg.channel.createMessage({
					content: '', embed: {
						title: "Too many games found!",
						description: "Your search resulted in too many games to display, please narrow your search.",
						color: 0xfd77a4
					}
				});
			}
		});

	}
}

module.exports = (new VersionUnSubscribe());