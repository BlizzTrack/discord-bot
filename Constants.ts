export const VERSION = require('./package.json').version;

export const BASE_URL = 'https://blizztrack.com';
export const BETA_BASE_URL = 'https://beta.blizztrack.com'

export const API_USE_BETA_URL = process.env.API_USE_BETA_URL == 'true';
export const USE_BETA_URL = process.env.USE_BETA_URL == 'true';


// Check Environment variables to determine which url to use.
export const API_BASE = API_USE_BETA_URL ? BETA_BASE_URL : BASE_URL; // Used to make API calls.

export const API_PATH = '/api';

export const MANIFEST_STABLE = (game: string, flag: string, seqn: number) => `${BASE_URL}/v/${game}/${flag}?latest-seqn=${seqn}`;
export const MANIFEST_BETA = (game: string, flag: string, seqn: number) => `${BETA_BASE_URL}/v/${game}/${flag}?latest-seqn=${seqn}`;

export const MANIFEST = USE_BETA_URL ? MANIFEST_BETA : MANIFEST_STABLE;// (game: string, flag: string, seqn: number) => `${NORMAL_BASE}/v/${game}/${flag}/${seqn}`;

export const DOCS = `https://beta.blizztrack.com/Docs/Bot`; // TODO: Check for beta url once stable is updated.

export const SUMMARY = `${API_BASE}${API_PATH}/summary`;
export const VERSIONS = (game: string) => `${API_BASE}${API_PATH}/ngpd/${game}/versions`;
export const CDN = (game: string) => `${API_BASE}${API_PATH}/ngpd/${game}/cdn`;

// TODO: Come up with more aliases
export const ALIASES: { [short: string]: string } = {
	ow: 'pro',
	heroes: 'hero',
	hots: 'hero'
}
