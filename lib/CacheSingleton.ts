import { Summary } from "../interfaces/API";
import { summary } from "./API";
import { IDiscordChannel, pool } from "./Database";

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
			return (this._summary = await summary());
		}
		return this._summary;
	}

	public async settings(): Promise<IDiscordChannel[]> {
		if (this._settingsCache == null || this._lastSettingsDate < Date.now() - 60 * 1000) {
			this._lastSettingsDate = Date.now();
			const quer = await pool.query<IDiscordChannel>("SELECT * FROM discord_channels");

			return (this._settingsCache = quer.rows);
		}
		return this._settingsCache;
	}

}