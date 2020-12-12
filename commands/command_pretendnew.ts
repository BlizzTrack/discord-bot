import { Client, Member, Message, TextChannel, User } from 'eris';
import { CommandEvent } from '../interfaces/DEvent';
import { Command } from '../structures/Command';
import { GameVersion } from '../lib/Responses';
import * as API from '../lib/API';

class PretendNew extends Command {

	constructor() {
		super('pretend', {
			syntax: "{name} <game>",
			category: 'root',
			hidden: true
		});
	}

	canRun(channel: TextChannel, member: Member | User): boolean {
		if (!(member instanceof Member)) return false;
		return member.guild.id == '251192826782679051' && member.roles.includes('254752175392161794');
	}

	get description(): string {
		return "DEV: Pretend <game> has new version";
	}

	async execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		let game = e.args.join(" ").toLowerCase();
		client.createMessage(msg.channel.id, GameVersion(await API.versions(game)));
	}
}

module.exports = (new PretendNew());