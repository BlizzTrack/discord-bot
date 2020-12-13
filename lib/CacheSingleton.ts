import { Summary } from "../interfaces/API";
import { summary } from "./API";

export class CacheSingleton {
	private static _instance: CacheSingleton;

	private _summary: Summary | null = null;
	private _lastSummaryDate: number = 0;

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

}