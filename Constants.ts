export const VERSION = require('./package.json').version;

export const BASE_URL = 'https://blizztrack.com';

// Check Environment variables to determine which url to use.

export const API_PATH = '/api';

export const DOCS = `https://blizztrack.com/Docs/Bot`; // TODO: Check for beta url once stable is updated.

export const MANIFEST = (game: string, flag: string, seqn: number) => `${BASE_URL}/v/${game}/${flag}?latest-seqn=${seqn}`;

export const ALL_PATCHNOTES = `${BASE_URL}/api/patch-notes/`;
export const PATCHNOTES = (game: string, type?: string) => `${BASE_URL}/api/patch-notes/${game}${type ? `/${type}` : ''}`;

export const SUMMARY = `${BASE_URL}${API_PATH}/summary`;
export const VERSIONS = (game: string) => `${BASE_URL}${API_PATH}/ngpd/${game}/versions`;
export const CDN = (game: string) => `${BASE_URL}${API_PATH}/ngpd/${game}/cdn`;

// TODO: Come up with more aliases
export const ALIASES: { [short: string]: string } = {
	ow: 'pro',
	heroes: 'hero',
	hots: 'hero',
	wowptr: 'wowt'
}