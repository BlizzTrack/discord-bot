import { Client, Message, TextChannel } from "eris";
import { VERSION } from "../Constants";
import { CommandEvent } from "../interfaces/DEvent";
import { Command } from "../structures/Command";

class BotInvite extends Command {

	constructor() {
		super('invite', {
			aliases: ['join'],
			category: 'information'
		});
	}

	get description() {
		return "Invite the BlizzTrack bot to your own server!.";
	}

	execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		msg.channel.createMessage({
			content: "",
			embed: {
				title: "Add BlizzTrack to your server",
				description: `You can add the BlizzTrack bot to your server by clicking [this link.](https://discord.com/oauth2/authorize?client_id=272526395337342977&scope=bot)\n\nClick [here](https://discord.gg/82HahAE) for our support server.`,
				thumbnail: {
					url: client.user.avatarURL
				}
			}
		});


	}

}

module.exports = (new BotInvite());