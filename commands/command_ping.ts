import { Client, Message } from "eris";
import { CommandEvent } from "../interfaces/DEvent";
import { Command } from "../structures/Command";

class Ping extends Command {

	constructor() {
		super('ping', {});
	}

	get description() {
		return "Test the bot's response time.";
	}

	execute(client: Client, msg: Message, e: CommandEvent) {
		msg.channel.createMessage(this.buildMessage()).then((msg2: Message) => {
			msg2.edit(this.buildMessage(msg2.timestamp - msg.timestamp));
		});
	}

	buildMessage(delay?: number): string {
		if (delay === undefined)
			return `<:info:785209415933362197> Pong!`;
		return `<:info:785209415933362197> Pong! - Time taken: **${delay}ms**`;
	}

}

module.exports = (new Ping());