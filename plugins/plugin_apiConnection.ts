import { Plugin } from '../structures/Plugin';
import https from 'https';
import { CDNRegion, Summary, VersionRegion, View } from '../interfaces/API';
import { CDN, SUMMARY, VERSIONS } from '../Constants';


class APIConnection extends Plugin {

	private options: https.RequestOptions = {
		headers: {
			'User-Agent': `BT-Bot TS! v I cba to do versions :)`,
			'Content-Type': 'application/json'
		}
	}

	constructor() {
		super("APIConnection");
	}

	get(url: string): Promise<string> {
		return new Promise((resolve, reject) => {
			https.request(url, this.options, (res) => {
				if (res.statusCode != 200)
					return reject(new Error(`Status code ${res.statusCode}`));
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					resolve(data);
				});
			});
		});
	}

	async apiGet<T>(url: string): Promise<T> {
		return JSON.parse(await this.get(url)) as T;
	}

	versions(game: string): Promise<View<VersionRegion>> {
		return this.apiGet<View<VersionRegion>>(VERSIONS(game));
	}

	cdn(game: string): Promise<View<CDNRegion>> {
		return this.apiGet<View<CDNRegion>>(CDN(game));
	}

	summary(): Promise<Summary> {
		return this.apiGet<Summary>(SUMMARY);
	}

}

module.exports = (new APIConnection());