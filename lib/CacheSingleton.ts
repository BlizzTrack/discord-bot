import { Summary } from "../interfaces/API";
import { summary } from "./API";
import { DiscordChannel, IDiscordChannel } from "./Database";
import { logger } from "./Logger";

export class CacheSingleton {
	private static _instance: CacheSingleton;

	private _summary: Summary | null = null;
	private _lastSummaryDate: number = 0;


	private _settingsCache: IDiscordChannel[] = []
	private _lastSettingsDate: number = 0;

	private constructor() { }

	public static get instance() {
		return this._instance || (this._instance = new this());
	}

	public async summary(): Promise<Summary> {
		if (this._summary == null || this._lastSummaryDate < Date.now() - 60 * 1000) {
			this._lastSummaryDate = Date.now();
			logger.verbose("Refreshing summary cache!");
			return (this._summary = await summary());
		}
		return this._summary;
	}

	public async settings(): Promise<IDiscordChannel[]> {
		if (this._settingsCache == null || this._lastSettingsDate < Date.now() - 60 * 1000) {
			this._lastSettingsDate = Date.now();
			logger.verbose("Refreshing discord_channels cache!");
			const quer = await DiscordChannel.findAll();

			return (this._settingsCache = quer);
		}
		return this._settingsCache;
	}

	public async upsertSubscription(guild: string, channel: string, game: string, enabled: boolean): Promise<UpsertResult> {
		const settingIndex: number = this._settingsCache.findIndex(setting => setting.channel == channel && setting.game == game);

		DiscordChannel.upsert({
			guild: guild,
			channel: channel,
			game: game,
			enabled: enabled
		});

		if (settingIndex != -1) {
			this._settingsCache[settingIndex].enabled = enabled;
			return UpsertResult.UPDATED;
		}

		this._settingsCache.push({
			guild: guild,
			channel: channel,
			game: game,
			enabled: enabled
		});

		return UpsertResult.INSERTED;
	}
}


export enum UpsertResult {
	INSERTED,
	UPDATED
}