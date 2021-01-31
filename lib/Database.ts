import {
	Sequelize,
	Model,
	DataTypes,
	Optional,
	fn,
} from "sequelize";

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

export const connection = new Sequelize(connectionString, {
	logging: false
});

//#region Interfaces
export interface IPostCache {
	game: string;
	seqn: number;
	posted: Date;
}

export interface IPatchNoteCache {
	game: string;
	type: string;
	created: Date;
	updated: Date;
}

export interface IDiscordChannel {
	guild: string;
	channel: string;
	game: string;
	enabled: boolean;
}

export interface IPagination {
	channel: string;
	message: string;
	author: string;
	command: string;
	subcommand?: string;
	page: number;
	data?: any;
}
//#endregion

//#region Models
export class DiscordChannel extends Model<IDiscordChannel> implements IDiscordChannel {
	public guild!: string;
	public channel!: string;
	public game!: string;
	public enabled!: boolean;
}

export class PatchNoteCache extends Model<IPatchNoteCache, Optional<IPatchNoteCache, 'updated' | 'created'>> implements IPatchNoteCache {
	public game!: string;
	public type!: string;
	public created!: Date;
	public updated!: Date;
}

export class PostCache extends Model<IPostCache, Optional<IPostCache, 'posted'>> implements IPostCache {
	public seqn!: number;
	public game!: string;
	public posted!: Date;
}

export class Pagination extends Model<IPagination> implements IPagination {
	public channel!: string;
	public message!: string;
	public author!: string;
	public command!: string;
	public subcommand?: string;
	public page!: number;
	public data?: any;
}
//#endregion

//#region Initialize Models
DiscordChannel.init(
	{
		guild: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		channel: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: false
		},
		game: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
	},
	{
		tableName: "discord_channels",
		sequelize: connection,
		timestamps: false
	}
);

PostCache.init(
	{
		seqn: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false
		},
		game: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		posted: {
			type: DataTypes.DATE,
			defaultValue: fn('NOW')
		}
	},
	{
		tableName: "post_cache",
		sequelize: connection,
		timestamps: false
	}
);

PatchNoteCache.init(
	{
		game: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		type: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		created: {
			type: DataTypes.DATE,
			defaultValue: fn('NOW')
		},
		updated: {
			type: DataTypes.DATE,
			defaultValue: fn('NOW')
		}
	},
	{
		tableName: "patchnote_cache",
		sequelize: connection,
		timestamps: false
	}
);


Pagination.init(
	{
		channel: {
			type: DataTypes.STRING,
			allowNull: false
		},
		message: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		author: {
			type: DataTypes.STRING,
			allowNull: false
		},
		command: {
			type: DataTypes.STRING,
			allowNull: false
		},
		subcommand: {
			type: DataTypes.STRING,
			allowNull: true
		},
		page: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		data: {
			type: DataTypes.JSON,
			allowNull: true
		},
	},
	{
		tableName: "command_pagination",
		sequelize: connection,
		timestamps: false
	}
);

//#endregion
