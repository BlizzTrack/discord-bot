export const VERSION = require('./package.json').version;

export const BASE_URL = 'https://blizztrack.com';
export const BETA_BASE_URL = 'https://beta.blizztrack.com'

// Check Environment variables to determine which url to use.
export const API_BASE = process.env.API_USE_BETA_URL ? BETA_BASE_URL : BASE_URL; // Used to make API calls.

export const API_PATH = '/api/NGPD';

export const MANIFEST_STABLE = (game: string, flag: string, seqn: number) => `${BASE_URL}/v/${game}/${flag}/${seqn}`;
export const MANIFEST_BETA = (game: string, flag: string, seqn: number) => `${BETA_BASE_URL}/v/${game}/${flag}?latest-seqn=${seqn}`;

export const MANIFEST = process.env.USE_BETA_URL ? MANIFEST_BETA : MANIFEST_STABLE;// (game: string, flag: string, seqn: number) => `${NORMAL_BASE}/v/${game}/${flag}/${seqn}`;

export const SUMMARY = `${API_BASE}${API_PATH}/summary`;
export const VERSIONS = (game: string) => `${API_BASE}${API_PATH}/${game}/versions`;
export const CDN = (game: string) => `${API_BASE}${API_PATH}/${game}/cdn`;

// TODO: Come up with more aliases
export const ALIASES: { [short: string]: string } = {
	ow: 'pro',
	heroes: 'hero',
	hots: 'hero'
}