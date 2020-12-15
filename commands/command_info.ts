import { Client, Message, TextChannel } from "eris";
import { DOCS, VERSION } from "../Constants";
import { CommandEvent } from "../interfaces/DEvent";
import { Command } from "../structures/Command";

class Info extends Command {

	constructor() {
		super('info', {
			category: 'information'
		});
	}

	get description() {
		return "General statistics about the bot.";
	}

	execute(client: Client, msg: Message<TextChannel>, e: CommandEvent) {
		msg.channel.createMessage({
			content: "",
			embed: {
				title: `${client.user.username} ${VERSION}`,
				description: `[BlizzTrack](https://blizztrack.com/) was made by Helba#0001\nThis bot was made by TheEvilSocks#0023.\n\nTo view all commands use \`bt!help\` or visit [the website](${DOCS})\nClick [here](https://discord.gg/82HahAE) for our support server.`,
				fields: [
					{
						name: ":diamonds: Shard",
						value: `Connected as shard **${msg.channel.guild.shard.id + 1}**`
					},
					{
						name: `:clock${Math.ceil(Math.random() * 12).toString() + (Math.round(Math.random()) == 0 ? "" : '30')}: Uptime`,
						value: uptime(process.uptime() * 1000, 2)
					}
				],
				thumbnail: {
					url: client.user.avatarURL
				},
				footer: {
					text: `Version ${VERSION}`
				}
			}
		});


	}

}

function uptime(ms: number, time_pieces: number): string {
	if (Number.isNaN(ms) || ms <= 0)
		return 'Unknown';

	const order = ['M', 'w', 'd', 'h', 'm', 's'];

	let uptime = [];
	let M, w, d, h, m, s;

	s = Math.floor(ms / 1000);
	m = Math.floor(s / 60);
	s = s % 60;
	h = Math.floor(m / 60);
	m = m % 60;
	d = Math.floor(h / 24);
	h = h % 24;
	w = Math.floor(d / 7);
	d = d % 7;
	M = Math.floor(w / 4);
	w = w % 4;

	const biggest = M ? 'M' : w ? 'w' : d ? 'd' : h ? 'h' : m ? 'm' : 's'; // fucking lmao

	uptime.push(M + (M == 1 ? " month" : ' months'));
	uptime.push(w + (w == 1 ? " week" : ' weeks'));
	uptime.push(d + (d == 1 ? " day" : ' days'));
	uptime.push(h + (h == 1 ? " hour" : ' hours'));
	uptime.push(m + (m == 1 ? " minute" : ' minutes'));
	uptime.push(s + (s == 1 ? " second" : ' seconds'));

	const out = time_pieces ? uptime.slice(order.indexOf(biggest), order.indexOf(biggest) + time_pieces).join(", ") : uptime.join(", ");

	return out.indexOf(',') > -1 ? (out.substring(0, out.lastIndexOf(",")) + ' and ' + out.substring(out.lastIndexOf(',') + 2)) : out;
}


module.exports = (new Info());