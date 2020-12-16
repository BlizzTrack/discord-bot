

import { Client, Message, TextChannel } from 'eris';
import { CONFIG as Config } from '../config';
import { DOCS } from '../Constants';
import { CommandEvent } from '../interfaces/DEvent';
import { Command } from '../structures/Command';


const HelpCommand = require('./help/help_command');


class Help extends Command {

	constructor() {
		let options = {
			aliases: ['h'],
			description: "Shows all commands, or information about a single command.",
			syntax: "{name} [command]",
			category: 'information'
		}

		super('help', options);
	}


	execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		if (e.args.length > 0)
			return HelpCommand.execute(client, msg, e);

		let positions: { [name: string]: number } = {
			information: 1,
			miscellaneous: 255
		};

		let fields = [], cmds = [];
		for (let i = 0; i < Object.keys(e.commands).length; i++) {
			let command = e.commands[Object.keys(e.commands)[i]];

			if (command.category != "root" && !command.hidden)
				cmds.push({
					name: command.name,
					description: command.description,
					category: command.category
				});
		}

		for (let i = 0; i < cmds.length; i++) {
			let catName = this.capitalize(cmds[i].category);
			if (fields.filter(f => f.name == catName).length == 0) {
				fields.push({ name: catName, value: '`' + cmds[i].name + '`' });
			} else {
				fields.filter(f => f.name == catName)[0].value += (", " + '`' + cmds[i].name + '`');
			}
		}

		fields.sort((a, b) => {
			let _a = positions[a.name.toLowerCase().replace(/ /g, "_")] ? positions[a.name.toLowerCase().replace(/ /g, "_")] : 128;
			let _b = positions[b.name.toLowerCase().replace(/ /g, "_")] ? positions[b.name.toLowerCase().replace(/ /g, "_")] : 128;

			if (_a < _b) return -1;
			if (_a > _b) return 1;
			return 0
		});


		msg.channel.createMessage({
			content: "",
			embed: {
				description: `Listed below are all the available commands.\nUse \`${Config.bot.prefix}help <command>\` to view further information.\n\nThere is a documentation with images and examples available on [our website](${DOCS})`,
				author: {
					icon_url: "http://i.imgur.com/c5x8hJg.png",
					name: "Help"
				},
				fields: fields
			}
		});
		return;

	}

	capitalize(str: string): string {
		if (!str) return '';

		return str.substring(0, 1).toUpperCase() + str.substring(1);
	}
}

module.exports = new Help();