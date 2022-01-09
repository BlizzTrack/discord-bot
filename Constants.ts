export const VERSION = require('./package.json').version;

export const BASE_URL = 'https://blizztrack.com';
export const API_URL = `${BASE_URL}/api`;

export const DOCS = `https://blizztrack.com/Docs/Bot`;

export const VIEW_MANIFEST = (game: string, flag: Flag, seqn: number) => `${BASE_URL}/v/${game}/${flag}?latest-seqn=${seqn}`;

export const ALL_PATCHNOTES = `${API_URL}/patch-notes/`;
export const PATCHNOTES = (game: string, type?: string) => `${API_URL}/patch-notes/${game}${type ? `/${type}` : ''}`;

export const SUMMARY = `${API_URL}/summary`;
export const VERSIONS = (game: string) => `${API_URL}/ngpd/${game}/versions`;
export const CDN = (game: string) => `${API_URL}/ngpd/${game}/cdn`;
export const MANIFEST = (game: string, flag: Flag, seqn?: number) => `${API_URL}/Manifest/${flag}/${game}${seqn !== undefined ? `?seqn=${seqn}` : ''}`;

// TODO: Come up with more aliases
export const ALIASES: { [short: string]: string } = {
	ow: 'pro',
	heroes: 'hero',
	hots: 'hero',
	wowptr: 'wowt'
}

export type Flag = 'versions' | 'cdn' | 'bgdl';