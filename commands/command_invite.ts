import { Client, Message, TextChannel } from "eris";
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
				title: `Add ${client.user.username} to your server`,
				description: `[<:AddBot:788494328551964700> Click this link](https://discord.com/oauth2/authorize?client_id=272526395337342977&permissions=537151488&scope=bot) to add ${client.user.username} to your server.\n\n[<:info:785209415933362197> Click here](https://discord.gg/82HahAE) for our support server.`,
				thumbnail: {
					url: client.user.avatarURL
				}
			}
		});


	}

}

module.exports = (new BotInvite());