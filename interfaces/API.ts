export interface Summary {
	seqn: number,
	command: string,
	name: string,
	code: string,
	data: SummaryItem[]
}

export interface SummaryItem {
	name: string,
	product: string,
	flags: 'cdn' | 'versions' | 'bgdl',
	seqn: number,
	relations: Relation[]
}

export interface Relation {
	view: string,
	seqn: string
}

export interface View<T extends Region> {
	name: string,
	indexed: string,
	seqn: number,
	code: string,
	command: string,
	data: T[]
}

export interface Region {
	region_name: string,
	region: string,
}

export interface VersionRegion extends Region {
	buildconfig: string,
	buildid: number,
	cdnconfig: string,
	keyring: string,
	versionsname: string,
	productconfig: string
}

export interface CDNRegion extends Region {
	path: string,
	hosts: string[],
	servers: string[],
	configPath: string
}