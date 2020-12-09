import { Client } from 'eris';
import { PluginEvent } from '../interfaces/DEvent';
import { Plugin } from '../structures/Plugin';
import * as API from '../lib/API';
import { Summary, VersionRegion, View } from '../interfaces/API';
import { IDiscordChannel, pool } from '../lib/Database';
import { GameVersion } from '../lib/Responses';

class VersionNotifications extends Plugin {

	private interval: number = -1;

	private summary: Summary | null = null;
	private versionCache: { [game: string]: number } = {};

	constructor() {
		super("VersionNotifications");
	}

	async initialize(client: Client, e: PluginEvent) {
		this.summary = await API.summary();
		for (let ver of this.summary.data.filter(s => s.flags == 'versions')) {
			if (!(await this.shouldPostMessage(ver.product, ver.seqn))) continue;

			this.postMessage(client, await API.versions(ver.product));
		}
	}

	/**
	 * Check to see if the API has a newer version of the game available than local cache.
	 * @param product Game code for which to check
	 */
	async shouldPostMessage(product: string, seqn: number): Promise<boolean> {
		if (!(product in this.versionCache)) {
			let data = await pool.query("SELECT seqn FROM post_cache WHERE game=$1", [product]);
			if (data.rowCount == 0) return true;

			this.versionCache[product] = data.rows[0]['seqn'];
			return seqn > data.rows[0]['seqn'];
		}

		return seqn > this.versionCache[product];
	}

	async postMessage(client: Client, game: View<VersionRegion>): Promise<any> {
		let channels = await pool.query<IDiscordChannel>("SELECT * FROM discord_channels WHERE game=$1", [game.code]);
		this.versionCache[game.code] = game.seqn;

		for (let channel of channels.rows)
			client.createMessage(channel.channel, GameVersion(game));
	}

}

module.exports = (new VersionNotifications());