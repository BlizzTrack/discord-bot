import {
	Sequelize,
	Model,
	DataTypes,
	Optional,
	fn,
} from "sequelize";

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

export const connection = new Sequelize(connectionString);


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
//#endregion

//#region Models
export class DiscordChannel extends Model<IDiscordChannel> implements IDiscordChannel {
	public guild!: string;
	public channel!: string;
	public game!: string;
	public enabled!: boolean;
}

export class PatchNoteCache extends Model<IPatchNoteCache, Optional<Optional<IPatchNoteCache, 'updated'>, 'created'>> implements IPatchNoteCache {
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
		sequelize: connection
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
		sequelize: connection
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
		sequelize: connection
	}
);
//#endregion

connection.sync({ alter: true })