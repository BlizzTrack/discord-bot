import { Client, Constants, Message, Permission, TextChannel } from 'eris';
import { CommandEvent } from '../interfaces/DEvent';
import { Command } from '../structures/Command';
import { IDiscordChannel, pool } from '../lib/Database';
import { ErrorMessage, OKMessage } from '../lib/Responses';
import * as API from '../lib/API';
import { ALIASES } from '../Constants';

class VersionUnSubscribe extends Command {

	constructor() {
		super('unsubscribe', {
			aliases: ['unsub'],
			syntax: "{name} <game>"
		});
	}

	get permission(): Permission {
		return new Permission(Constants.Permissions.manageWebhooks, 0);
	}

	get description(): string {
		return "Unsubscribe from a game. Unsubscribing from a game will **stop** posting messages whenever a new version is found.";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		let game = e.args.join(" ").toLowerCase();
		if (!game) return msg.channel.createMessage(ErrorMessage("You forgot to tell me which game to unsubscribe from!"));

		const settings = await pool.query<IDiscordChannel>("SELECT * FROM discord_channels WHERE channel=$1", [msg.channel.id]);

		const summary = (await API.summary()).data.filter(s => s.flags == 'versions').filter(g => settings.rows.find(r => r.game == g.product)); // TODO: Cache this in a singleton
		let sumGame = summary.find(sum => game == sum.name.toLowerCase() || game == sum.product.toLowerCase());

		if (!sumGame)
			if (game in ALIASES)
				sumGame = summary.find(sum => ALIASES[game] == sum.product.toLowerCase());


		// Early exit if exact match.
		if (sumGame) {
			const curGame = settings.rows.find(set => set.game == sumGame?.product);
			if (curGame && curGame.enabled) {
				await pool.query("DELETE FROM discord_channels WHERE guild=$1 AND channel=$2 AND game=$3", [msg.channel.guild.id, msg.channel.id, sumGame.product]);
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
			const curGame = settings.rows.find(set => set.game == sumGames[0]?.product);
			if (curGame && curGame.enabled) {
				await pool.query("DELETE FROM discord_channels WHERE guild=$1 AND channel=$2 AND game=$3", [msg.channel.guild.id, msg.channel.id, sumGames[0]?.product]);
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
		});

	}
}

module.exports = (new VersionUnSubscribe());