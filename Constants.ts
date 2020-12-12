export const VERSION = require('./package.json').version;

export const BASE_URL = 'https://beta.blizztrack.com';
export const API_PATH = '/api/NGPD';

export const MANIFEST = (game: string, flag: string, seqn: number) => `https://blizztrack.com/v/${game}/${flag}/${seqn}`;

export const SUMMARY = `${BASE_URL}${API_PATH}/summary`;
export const VERSIONS = (game: string) => `${BASE_URL}${API_PATH}/${game}/versions`;
export const CDN = (game: string) => `${BASE_URL}${API_PATH}/${game}/cdn`;

// TODO: Come up with more aliases
export const ALIASES: { [short: string]: string } = {
	ow: 'pro',
	heroes: 'hero',
	hots: 'hero'
}