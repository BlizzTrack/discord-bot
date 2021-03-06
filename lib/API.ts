import https from 'https';
import { CDN, MANIFEST, SUMMARY, VERSION, VERSIONS } from '../Constants';
import { CDNRegion, Manifest, Summary, VersionRegion, View } from '../interfaces/API';
import { logger } from './Logger';


const options: https.RequestOptions = {
	method: "GET",
	headers: {
		'User-Agent': `BT-Bot TypeScript, v${VERSION}`
	}
}


export function get(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const req = https.request(url, options, (res) => {
			if (res.statusCode != 200)
				return reject(new Error(`Status code ${res.statusCode} ${url}`));
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				resolve(data);
			});
		});

		req.on('error', error => {
			logger.error(`[API] Error on ${req.method} ${url}\n`, error);
			logger.verbose(req);
		})

		req.end();
	});
}

export async function apiGet<T>(url: string): Promise<T> {
	return JSON.parse(await get(url)) as T;
}

export function versions(game: string): Promise<View<VersionRegion>> {
	return apiGet<View<VersionRegion>>(VERSIONS(game));
}


export function versions_from_seqn(game: string, seqn?: number): Promise<Manifest<VersionRegion>> {
	return apiGet<Manifest<VersionRegion>>(`${MANIFEST(game, 'versions', seqn)}`);
}

export function cdn(game: string): Promise<View<CDNRegion>> {
	return apiGet<View<CDNRegion>>(CDN(game));
}

export function summary(): Promise<Summary> {
	return apiGet<Summary>(SUMMARY);
}
