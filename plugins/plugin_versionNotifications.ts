import { Client } from 'eris';
import { Op } from 'sequelize';
import { Manifest, VersionRegion, View } from '../interfaces/API';
import { PluginEvent } from '../interfaces/DEvent';
import * as API from '../lib/API';
import { CacheSingleton } from '../lib/CacheSingleton';
import { DiscordChannel, VersionCache } from '../lib/Database';
import { logger } from '../lib/Logger';
import { GameVersion } from '../lib/Responses';
import { Plugin } from '../structures/Plugin';

class VersionNotifications extends Plugin {

	private cache: CacheSingleton;
	private interval: NodeJS.Timeout | null = null;
	private versionCache: { [game: string]: { [seqn: number]: { [region: string]: string } } } = {};
	private seqnCache: { [game: string]: number } = {};

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
			try {
				this.postMessage(this.client, await API.versions_from_seqn(ver.product, ver.seqn));
			} catch (err) {
				logger.error(`Failed to send ${ver.name} to Discord.\n${err}`);
			}
		}
	}

	/**
	 * Check to see if the API has a newer version of the game available than local cache.
	 * @param product Game code for which to check
	 */
	async shouldPostMessage(product: string, seqn: number): Promise<boolean> {
		// Check to see if we have *any* seqn cached for this product.
		if (product in this.seqnCache) {
			// If we do, check if the seqn we are dealing with is older than the cached one. If so, we should return false.
			if (seqn <= this.seqnCache[product])
				return false;

			// Now we know that the seqn is newer than the cached one, 
			// while unlikely, we should check to see if we already know this seqn has a version cached.
			if (product in this.versionCache)
				if (seqn in this.versionCache[product])
					return false; // We must've already posted this version.
		}

		// While we might not have these cached in memory, we should check the database.
		const cached = await VersionCache.findAll({
			where: {
				game: product,
				seqn
			}
		});

		// Yeet these in the local cache.
		cached.forEach(c => {
			this.updateCache(product, c.seqn, c.region, c.version, false);
		});

		// We've seen this seqn before, so we should return false.
		if (cached.length > 0)
			return false;

		// Version numbers aren't 'unique', multiple seqns might have the same version number.
		// We should check to see if the version actually changed, we'll have to query the API.
		let versions;
		try {
			versions = await API.versions_from_seqn(product, seqn);
		} catch (err) {
			// Sometimes the API has no data for a game, so we should just return false.
			return false;
		}

		// TODO: Check version per region, instead of just checking the first one.
		const cached2 = await VersionCache.findAll({
			where: {
				game: product,
				version: versions.data[0].versionsname
			}
		});

		// Yeet these versions into the database.
		versions.data.forEach(version => {
			this.updateCache(product, seqn, version.region, version.versionsname);
		});

		if (cached2.length > 0)
			return false;

		return true;
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

	async postMessage(client: Client, game: Manifest<VersionRegion>): Promise<any> {
		const channels = await DiscordChannel.findAll({
			where: {
				[Op.or]: [
					{ game: game.product },
					{ game: '*' }
				]
			}
		});

		for (let channel of channels) {
			if (channel.channel && await this.shouldPostInChannel(channel.guild, channel.channel, game.product)) {
				if (channel.game === '*' && game.name.toLowerCase().includes("vendor"))
					continue;
				client.createMessage(channel.channel, GameVersion(game));
			}
		}
	}

	async updateCache(game: string, seqn: number, region: string, version: string, writeToDatabase = true): Promise<boolean> {
		if (seqn > this.seqnCache[game])
			this.seqnCache[game] = seqn;

		if (!(game in this.versionCache))
			this.versionCache[game] = {};

		this.versionCache[game][seqn] = {};
		this.versionCache[game][seqn][region] = version;

		if (writeToDatabase) {
			await VersionCache.create({
				game,
				region,
				seqn,
				version,
				dateCrawled: new Date(),
			});
		}

		return true;
	}
}

module.exports = (new VersionNotifications());
