import { Permission, Member, Client, Message, User } from "eris";
import { CommandOptions } from '../interfaces/CommandOptions';
import { CommandEvent, PluginEvent } from "../interfaces/DEvent";

const Permissions = require("eris").Constants.Permissions;

export class Command {


	public readonly name: string = '';
	public readonly permission: Permission = new Permission(0, 0);
	public readonly cooldown: number = 1000;
	public readonly description: string = "";
	public readonly extendedDescription: string = "";
	public readonly syntax: string = '';
	public readonly category: string = 'Miscellaneous';
	public readonly subcommands: { [name: string]: Command } = {};
	public readonly aliases: string[] = [];
	public readonly guildOnly: boolean = false;;
	public readonly hidden: boolean = false;
	public readonly hideSubcommands: boolean = false
	public readonly hideSyntax: boolean = false;
	public hasPostInitialized: boolean = false;


	private _parent?: Command;
	public get parent(): Command | undefined {
		return this._parent;
	}


	constructor(name: string, options: CommandOptions) {
		if (!name)
			throw new Error("Command name cannot be empty.");
		options = options || {};
		this.name = name;
		this.syntax = name;


		if (options.permission) {
			if (options.permission instanceof Array) {
				let perm_allow = 0;
				for (let perm of options.permission)
					perm_allow += Permissions[perm];
				this.permission = new Permission(perm_allow, 0);
			} else {
				this.permission = options.permission;
			}
		}


		if (options.cooldown)
			this.cooldown = options.cooldown;

		if (options.description)
			this.description = options.description;

		if (options.extendedDescription)
			this.extendedDescription = options.extendedDescription;

		if (options.syntax)
			this.syntax = options.syntax;

		if (options.category)
			this.category = options.category;

		if (options.parent)
			this._parent = options.parent;

		if (options.aliases)
			this.aliases = options.aliases;

		if (options.guildOnly)
			this.guildOnly = options.guildOnly;

		if (options.hidden)
			this.hidden = options.hidden;

		if (options.hideSubcommands)
			this.hideSubcommands = options.hideSubcommands;

		if (options.hideSyntax)
			this.hideSyntax = options.hideSyntax;


		this.hasPostInitialized = false;
	}

	canRun(member: Member | User) {
		if (this.guildOnly) {
			if (!('guild' in member)) return false;
			if (member.guild.ownerID == member.id) return true;
			return (this.permission.allow & member.permission.allow) == this.permission.allow || member.permission.has("administrator");
		}
		return true;
	}


	initialize(client: Client, e: PluginEvent) { }
	postInitialize(client: Client, e: PluginEvent) { }
	deinitialize(client: Client, e: PluginEvent) { }

	/**
	 * 
	 * @param {Client} client The Eris client.
	 * @param {Message} msg The Discord Message.
	 * @param {Object} e Extra variables.
	 * @param {Object} e.commands Currently loaded commands.
	 * @param {Object} e.plugins Currently loaded plugins.
	 * @param {Array<String>} e.args Command arguments passed down by the user.
	 * @param {String} e.executedCommand The command or alias used to execute the command.
	 * @param {String} usedPrefix The prefix used to invoke the command.
	 */
	execute(client: Client, msg: Message, e: CommandEvent): void | Promise<any> { }


	get help() {
		return `${this.description}\n\`\`\`js\n${this.syntax}\`\`\``
	}

	addSubcommand(command: Command) {
		if (this.subcommands[command.name.toLowerCase()])
			throw new Error(`A subcommand with that name is already added!\nMainCommand: ${this.name}\nSubCommand: ${command.name}`);


		this.subcommands[command.name.toLowerCase()] = command;
		command.setParent(this);
		return this;

	}

	setParent(command: Command) {
		this._parent = command;
		return this;
	}


}