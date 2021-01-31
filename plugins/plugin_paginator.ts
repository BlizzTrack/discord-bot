import { Client, Emoji, Member, PossiblyUncachedMessage } from 'eris';
import { PluginEvent } from '../interfaces/DEvent';
import { Pagination } from '../lib/Database';
import { PageCommand } from '../structures/PageCommand';
import { Plugin } from '../structures/Plugin';

const NOOP = () => { };

export class Paginator extends Plugin {

	constructor() {
		super("pagination");
	}

	// TODO: Automatically clear pagination table rows after they've reached a certain age.
	initialize(client: Client, e: PluginEvent): void {
		Pagination.truncate(); // Forget about previously saved pagination, there's no need to keep these for a long time.

		this.registerHandler("messageReactionAdd", async (msg: PossiblyUncachedMessage, emoji: Emoji, reactor: Member | { id: string }) => {
			if (!["⬅️", "➡️"].includes(emoji.name)) return;
			if (!msg || !emoji || !reactor) return;
			if (reactor.id == client.user.id) return;

			const curPage = await Pagination.findOne({ where: { message: msg.id, author: reactor.id } });

			if (!curPage) return;

			// TODO: Why is this deprecated?
			client.removeMessageReaction(msg.channel.id, msg.id, emoji.name, reactor.id); // Remove reaction for better user experience

			let cmd = e.commands[curPage.command];
			if (curPage.subcommand) cmd = cmd.subcommands[curPage.subcommand];

			if (!cmd || !('paginate' in cmd)) return;

			const command: PageCommand = (cmd as PageCommand);

			const prevPageInfo = await command.paginate(reactor.id, msg.channel.id, curPage.page, curPage.data);

			console.log(prevPageInfo);
			if (!prevPageInfo.hasPrevious && emoji.name == "⬅️") return;
			if (!prevPageInfo.hasNext && emoji.name == "➡️") return;

			let page = curPage.page;
			if (emoji.name == "➡️") page++;
			if (emoji.name == "⬅️") page--;

			const pageInfo = await command.paginate(reactor.id, msg.channel.id, page, curPage.data);
			console.log(pageInfo);
			client.editMessage(curPage.channel, curPage.message, pageInfo.content);

			Pagination.update({ page: page }, { where: { message: curPage.message } });

			// Make sure the arrows are in the correct position.
			// Back arrow should always be on the left!
			if (!prevPageInfo.hasPrevious && pageInfo.hasPrevious)
				await client.removeMessageReactions(msg.channel.id, msg.id);

			if (pageInfo.hasPrevious)
				await client.addMessageReaction(msg.channel.id, msg.id, "⬅️").then(NOOP, NOOP);
			else
				client.removeMessageReactionEmoji(msg.channel.id, msg.id, "⬅️").then(NOOP, NOOP);

			if (pageInfo.hasNext)
				client.addMessageReaction(msg.channel.id, msg.id, "➡️").then(NOOP, NOOP);
			else
				client.removeMessageReactionEmoji(msg.channel.id, msg.id, "➡️").then(NOOP, NOOP);
		});

	}

	async create(command: PageCommand, author: string, channel: string, page: number, data?: any): Promise<void> {
		const curPage = await command.paginate(author, channel, page, data);
		this.client?.createMessage(channel, curPage.content).then(async (_msg) => {
			if (curPage.hasPrevious)
				await _msg.addReaction("⬅️").then(NOOP, NOOP);

			if (curPage.hasNext)
				_msg.addReaction("➡️").then(NOOP, NOOP);

			Pagination.create({
				message: _msg.id,
				channel: _msg.channel.id,
				author: author,
				page: 0,
				command: command.name,
				data: data
			});
		});
	}

}

module.exports = (new Paginator());