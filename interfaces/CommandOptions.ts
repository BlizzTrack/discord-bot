import { Permission as Permissions } from "eris";
import { Command } from '../structures/Command';

export interface CommandOptions {
	permissions?: Permissions | string[];
	cooldown?: number;
	description?: string;
	extendedDescription?: string;
	syntax?: string;
	category?: string;
	parent?: Command;
	subcommands?: object;
	aliases?: string[];
	guildOnly?: boolean;
	hidden?: boolean;
	hideSubcommands?: boolean;
	hideSyntax?: boolean;
}