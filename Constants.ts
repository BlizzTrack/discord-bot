export const BASE_URL = 'https://beta.blizztrack.com/api/NGPD'
export const SUMMARY = `${BASE_URL}/summary`;
export const VERSIONS = (game: string) => `${BASE_URL}/${game}/versions`;
export const CDN = (game: string) => `${BASE_URL}/${game}/cdn`;