import { Permission, Member, Client, Message, User } from "eris";
import { CommandOptions } from '../interfaces/CommandOptions';
import { CommandEvent, PluginEvent } from "../interfaces/DEvent";

const Permissions = require("eris").Constants.Permissions;

export class Command {


	private _name: string = '';
	private _permission: Permission = new Permission(0, 0);
	private _cooldown: number = 1000;
	private _description: string = "";
	private _extendedDescription: string = "";
	private _syntax: string = '';
	private _category: string = 'Miscellaneous';
	private _subcommands: { [name: string]: Command } = {};
	private _aliases: string[] = [];
	private _hidden: boolean = false;
	private _hideSubcommands: boolean = false
	private _hideSyntax: boolean = false;
	public hasPostInitialized: boolean = false;


	private _parent?: Command;
	public get parent(): Command | undefined {
		return this._parent;
	}

	constructor(name: string, options: CommandOptions) {
		if (!name)
			throw new Error("Command name cannot be empty.");
		options = options || {};
		this._name = name;
		this._syntax = name;


		if (options.permission) {
			if (options.permission instanceof Array) {
				let perm_allow = 0;
				for (let perm of options.permission)
					perm_allow += Permissions[perm];
				this._permission = new Permission(perm_allow, 0);
			} else {
				this._permission = options.permission;
			}
		}


		if (options.cooldown)
			this._cooldown = options.cooldown;

		if (options.description)
			this._description = options.description;

		if (options.extendedDescription)
			this._extendedDescription = options.extendedDescription;

		if (options.syntax)
			this._syntax = options.syntax;

		if (options.category)
			this._category = options.category;

		if (options.parent)
			this._parent = options.parent;

		if (options.aliases)
			this._aliases = options.aliases;

		if (options.hidden)
			this._hidden = options.hidden;

		if (options.hideSubcommands)
			this._hideSubcommands = options.hideSubcommands;

		if (options.hideSyntax)
			this._hideSyntax = options.hideSyntax;


		this.hasPostInitialized = false;
	}

	get name() {
		return this._name;
	}

	get description() {
		return this._description;
	}

	get extendedDescription() {
		return this._extendedDescription;
	}

	get syntax() {
		let ret = this._syntax;
		if (this.parent && this.parent instanceof Command)
			ret = ret.replace(/{name}/g, `${this.parent.name} ${this.name}`);
		else
			ret = ret.replace(/{name}/g, this.name);
		return ret;
	}

	get cooldown() {
		return this._cooldown || 1000;
	}

	get category() {
		return this._category;
	}

	get permission() {
		return this._permission;
	}

	get aliases() {
		return this._aliases || [];
	}

	get subcommands() {
		return this._subcommands;
	}

	get hidden() {
		return this._hidden;
	}

	get hideSubcommands() {
		return this._hideSubcommands;
	}

	get hideSyntax() {
		return this._hideSyntax;
	}

	canRun(member: Member | User): boolean {
		if (!(member instanceof Member))
			return this.permission.allow == 0;
		if (member.guild.ownerID == member.id) return true;
		return (this.permission.allow & member.permissions.allow) == this.permission.allow || member.permissions.has("administrator");

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