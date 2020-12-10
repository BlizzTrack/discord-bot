import { Client } from 'eris';
import { PluginEvent } from '../interfaces/DEvent';
import { Plugin } from '../structures/Plugin';
import * as API from '../lib/API';
import { Summary, VersionRegion, View } from '../interfaces/API';
import { IDiscordChannel, pool } from '../lib/Database';
import { GameVersion } from '../lib/Responses';
import { logger } from '../lib/Logger';

class VersionNotifications extends Plugin {

	private interval: NodeJS.Timeout | null = null;

	private summary: Summary | null = null;
	private versionCache: { [game: string]: number } = {};
	private settingsCache: IDiscordChannel[] = [];

	constructor() {
		super("VersionNotifications");
	}

	initialize(client: Client, e: PluginEvent): void {
		this.doWork();

		this.interval = setInterval(this.doWork, 60000);
	}

	deinitialize(client: Client, e: PluginEvent) {
		if (this.interval !== null)
			clearInterval(this.interval);
	}

	async doWork() {
		if (this.client == undefined) return;

		this.summary = await API.summary();
		for (let ver of this.summary.data.filter(s => s.flags == 'versions')) {
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
		logger.debug(product, seqn);
		if (product in this.versionCache)
			return seqn > this.versionCache[product];

		let data = await pool.query("SELECT seqn FROM post_cache WHERE game=$1 ORDER BY seqn DESC", [product]);
		if (data.rowCount == 0) return true;

		this.versionCache[product] = data.rows[0]['seqn'];
		return seqn > data.rows[0]['seqn'];
	}

	async shouldPostInChannel(guild: string, channel: string, game: string): Promise<boolean> {
		let guildSettings = this.settingsCache.filter(s => s.guild == guild);
		if (guildSettings.length == 0) return false;

		let globalSetting = guildSettings.find(s => !s.channel);
		let channelSetting = guildSettings.find(s => s.channel == channel);

		if (channelSetting)
			return channelSetting.enabled;

		if (globalSetting)
			return globalSetting.enabled;

		return false;
	}

	async postMessage(client: Client, game: View<VersionRegion>): Promise<any> {
		let channels = await pool.query<IDiscordChannel>("SELECT * FROM discord_channels WHERE game=$1", [game.code]);
		this.updateCache(game.code, game.seqn);

		for (let channel of channels.rows)
			if (channel.channel && await this.shouldPostInChannel(channel.guild, channel.channel, game.code))
				client.createMessage(channel.channel, GameVersion(game));
	}

	async updateCache(game: string, seqn: number): Promise<boolean> {
		this.versionCache[game] = seqn;
		await pool.query("INSERT INTO post_cache(game, seqn) VALUES($1, $2)", [game, seqn])
		return true;
	}

}

module.exports = (new VersionNotifications());