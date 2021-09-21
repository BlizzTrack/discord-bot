import { Client, Message, TextChannel } from 'eris';
import { CommandEvent } from '../../interfaces/DEvent';
import { Command } from '../../structures/Command';

const permissionTable: { [name: string]: string } = {
	"administrator": "Administrator",
	"viewAuditLogs": "View Audit Log",
	"manageGuild": "Manage Server",
	"manageRoles": "Manage Roles",
	"manageChannels": "Manage Channels",
	"kickMembers": "Kick Members",
	"banMembers": "Ban Members",
	"createInstantInvite": "Create Instant Invite",
	"changeNickname": "Change Nickname",
	"manageNicknames": "Manage Nicknames",
	"manageEmojis": "Manage Emojis",
	"manageWebhooks": "Manage Webhooks",
	"readMessages": "Read Text Channels & See Voice Channels",

	"sendMessages": "Send Messages",
	"sendTTSMessages": "Send TTS Messages",
	"manageMessages": "Manage Messages",
	"embedLinks": "Embed Links",
	"attachFiles": "Attach Files",
	"readMessageHistory": "Read Message History",
	"mentionEveryone": "Mention Everyone",
	"externalEmojis": "Use External Emojis",
	"addReactions": "Add Reactions",

	"voiceConnect": "Connect",
	"voiceSpeak": "Speak",
	"voiceMuteMembers": "Mute Members",
	"voiceDeafenMembers": "Deafen Members",
	"voiceMoveMembers": "Move Members",
	"voiceUseVAD": "Use Voice Activity",
	"voicePrioritySpeaker": "Priority Speaker"
}


class HelpCommand extends Command {

	constructor() {
		let options = {
			description: "Shows help information for a command.",
			syntax: "{name} <command>",
			category: 'information'
		}

		super('help', options);
	}


	execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		let baseCommand: Command | null = e.commands[e.args[0].toLowerCase()] ? e.commands[e.args[0].toLowerCase()] : findCommandForAlias(e.commands, e.args[0].toLowerCase());

		if (!baseCommand)
			return msg.channel.createMessage({ content: "", embed: { description: ":x: I do not know that command.", color: 0xdd2e44 } });

		let bCommand: Command = baseCommand;
		let command: Command = baseCommand;
		let permissions: string[] = [];
		let subcommands: string[] = [];
		let syntax: string;


		if (bCommand.permissions.allow > 0) //@ts-ignore ts(7053)
			permissions = Object.keys(baseCommand.permissions.json).filter(k => bCommand.permissions.json[k]); // Check if permission is true.

		if (bCommand.permissions.json.administrator)
			permissions.push("administrator");

		// Check for subcommands & their permissions
		if (e.args[1]) {
			if (bCommand.subcommands && (bCommand.subcommands[e.args[1].toLowerCase()] || findCommandForAlias(bCommand.subcommands, e.args[1].toLowerCase()))) {
				command = bCommand.subcommands[e.args[1].toLowerCase()] || findCommandForAlias(bCommand.subcommands, e.args[1].toLowerCase());

				syntax = command.syntax.replace(/{name}/g, bCommand.name);

				if (bCommand.permissions.allow > 0) //@ts-ignore ts(7053)
					permissions = permissions.concat(Object.keys(bCommand.permissions.json).filter(k => bCommand.permissions.json[k])); // Check if permission is true.

				if (command.permissions.json.administrator)
					permissions.push("administrator");

			} else {
				msg.channel.createMessage(`**${e.commands[e.args[0].toLowerCase()].name}** does not have that subcommand.`);
				return;
			}
		} else {
			syntax = baseCommand.syntax.replace(/{name}/g, baseCommand.name);
			if (baseCommand.permissions.allow > 0) //@ts-ignore ts(7053)
				permissions = permissions.concat(Object.keys(baseCommand.permissions.json).filter(perm => baseCommand.permissions.json[perm]));

			if (baseCommand.permissions.json.administrator)
				permissions.push("administrator");

			// Grab subcommands & their syntaxes
			let _done: string[] = [];
			for (let sub_name of Object.keys(baseCommand.subcommands)) {
				subcommands.push(`\`${sub_name}\``);

				// Avoid listing the same syntax multiple times.
				if (_done.includes(baseCommand.subcommands[sub_name].syntax)) continue;
				_done.push(baseCommand.subcommands[sub_name].syntax);
				syntax += `\n${baseCommand.subcommands[sub_name].syntax.replace(/{name}/g, baseCommand.name)}`;

			}
		}

		let embed: any = {
			fields: [],
			author: {
				icon_url: "http://i.imgur.com/c5x8hJg.png",
				name: "Help"
			},
			description: command.description
		};

		if (command.extendedDescription)
			embed = Object.assign(embed, command.extendedDescription);

		let fields: { name: string, value: string }[] = [];

		if (!command.hideSyntax)
			fields.push({
				name: "Usage",
				value: "```apache\n" + syntax + "```"
			});

		if (permissions.length > 0) {
			fields.push({
				name: "Permissions Required",
				value: permissions.filter((it, ind) => permissions.indexOf(it) == ind).map(perm => permissionTable[perm]).join(", ")
			});
		}

		if (!command.hideSubcommands && subcommands && subcommands.length > 0) {
			fields.push({
				name: "Subcommands",
				value: subcommands.join(", ")
			});
		}

		if (command.aliases && command.aliases.length > 0) {
			fields.push({
				name: 'Aliases',
				value: command.aliases.map(a => `\`${a}\``).join(", ")
			});
		}

		embed.fields = fields;

		msg.channel.createMessage({
			content: "",
			embed: embed
		});

	}
}

module.exports = new HelpCommand();


function findCommandForAlias(head: { [name: string]: Command }, alias: string): Command | null {
	for (let key of Object.keys(head))
		if (head[key].aliases.includes(alias))
			return head[key];
	return null;
}