import {
	Sequelize,
	Model,
	ModelDefined,
	DataTypes,
	HasManyGetAssociationsMixin,
	HasManyAddAssociationMixin,
	HasManyHasAssociationMixin,
	Association,
	HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
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
	guild: string;
	channel: string;
	game: string;
	enabled: boolean;
}

export class PatchNoteCache extends Model<IPatchNoteCache> implements IPatchNoteCache {
	game: string;
	type: string;
	created: Date;
	updated: Date;
}

export class PostCache extends Model<IPostCache> implements IPostCache {
	seqn: number;
	game: string;
	posted: Date;
}
//#endregion

//#region Initialize Models
DiscordChannel.init(
	{
		guild: {
			type: DataTypes.BIGINT,
			allowNull: false
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
			defaultValue: fn('NOW'),
			allowNull: false
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
			defaultValue: fn('NOW'),
			allowNull: false
		},
		updated: {
			type: DataTypes.DATE,
			defaultValue: fn('NOW'),
			allowNull: true
		}
	},
	{
		tableName: "patchnote_cache",
		sequelize: connection
	}
);
//#endregion