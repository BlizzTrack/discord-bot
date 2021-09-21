import { Client, Constants, Message, Permission, TextChannel } from 'eris';
import { CommandEvent } from '../interfaces/DEvent';
import { DiscordChannel } from '../lib/Database';
import { OKMessage } from '../lib/Responses';
import { Command } from '../structures/Command';

class ClearSubs extends Command {

	constructor() {
		super('clearsubscriptions', {
			aliases: ['clearsubs', 'clearsub'],
			category: 'BlizzTrack',
			syntax: "{name}"
		});
	}

	get permissions(): Permission {
		return new Permission(Constants.Permissions.manageWebhooks, 0);
	}

	get description(): string {
		return "Completely remove all subscriptions from this channel. **You will no longer receive messages when new versions are available**.";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		const settings = await DiscordChannel.findAll({ where: { channel: msg.channel.id } });

		await DiscordChannel.destroy({
			where: {
				guild: msg.channel.guild.id,
				channel: msg.channel.id
			}
		});
		return msg.channel.createMessage(OKMessage(`Successfully unsubscribed from **${settings.length}** games!`));

	}
}

module.exports = (new ClearSubs());