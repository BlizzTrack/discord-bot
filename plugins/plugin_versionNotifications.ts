import { Client } from 'eris';
import { Op, Sequelize } from 'sequelize';
import { VersionRegion, View } from '../interfaces/API';
import { PluginEvent } from '../interfaces/DEvent';
import * as API from '../lib/API';
import { CacheSingleton } from '../lib/CacheSingleton';
import { DiscordChannel, PostCache } from '../lib/Database';
import { logger } from '../lib/Logger';
import { GameVersion } from '../lib/Responses';
import { Plugin } from '../structures/Plugin';

class VersionNotifications extends Plugin {

	private cache: CacheSingleton;
	private interval: NodeJS.Timeout | null = null;
	private versionCache: { [game: string]: number } = {};

	constructor() {
		super("VersionNotifications");

		this.cache = CacheSingleton.instance;
	}

	initialize(client: Client, e: PluginEvent): void {
		this.doWork();

		this.interval = setInterval(() => { this.doWork() }, 60000);
	}

	deinitialize(client: Client, e: PluginEvent) {
		if (this.interval !== null)
			clearInterval(this.interval);
	}

	async doWork() {
		if (this.client == undefined) return;

		for (let ver of (await this.cache.summary()).data.filter(s => s.flags == 'versions')) {
			if (!(await this.shouldPostMessage(ver.product, ver.seqn))) continue;

			logger.debug(`${ver.name} is ready for sending.`);
			this.postMessage(this.client, await API.versions(ver.product));
		}
	}

	/**
	 * Check to see if the API has a newer version of the game available than local cache.
	 * @param product Game code for which to check
	 */
	async shouldPostMessage(product: string, seqn: number): Promise<boolean> {
		if (product in this.versionCache)
			return seqn > this.versionCache[product];

		// SELECT MAX(seqn) as seqn FROM post_cache WHERE game=${product} LIMIT 1
		let data = await PostCache.findOne({
			attributes: [
				[Sequelize.fn('MAX', Sequelize.col('seqn')), 'seqn']
			],
			where: {
				game: product
			}
		});
		if (!data) return true;
		this.versionCache[product] = data.seqn;

		return seqn > data.seqn;
	}

	async shouldPostInChannel(guild: string, channel: string, game: string): Promise<boolean> {
		let guildSettings = (await this.cache.settings()).filter(s => s.channel == channel && s.guild == guild);
		if (guildSettings.length == 0) return false; // Shouldn't really happen, but checking anyway :)

		let globalSetting = guildSettings.find(s => s.game == '*');
		let channelSetting = guildSettings.find(s => s.game == game);

		if (channelSetting)
			return channelSetting.enabled;

		if (globalSetting)
			return globalSetting.enabled;

		return false;
	}

	async postMessage(client: Client, game: View<VersionRegion>): Promise<any> {
		// SELECT * FROM discord_channels WHERE game=${game.code} OR game='*'
		let channels = await DiscordChannel.findAll({
			where: {
				[Op.or]: [
					{ game: game.code },
					{ game: '*' }
				]
			}
		});
		this.updateCache(game.code, game.seqn);

		for (let channel of channels)
			if (channel.channel && await this.shouldPostInChannel(channel.guild, channel.channel, game.code))
				client.createMessage(channel.channel, GameVersion(game));
	}

	async updateCache(game: string, seqn: number): Promise<boolean> {
		this.versionCache[game] = seqn;
		// INSERT INTO post_cache(game, seqn) VALUES(${game}, ${seqn})
		await PostCache.create({
			game: game,
			seqn: seqn
		});
		return true;
	}

}

module.exports = (new VersionNotifications());
