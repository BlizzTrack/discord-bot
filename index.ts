let isReady = false;
process.chdir(__dirname);

if (process.env.RUNNING_MODE)
	process.env.NODE_ENV = process.env.RUNNING_MODE;
if (process.env.NODE_ENV == "release")
	process.env.NODE_ENV = 'production';


import { Client as Eris, Guild, Message, TextChannel } from 'eris';
import fs from 'fs';
import { CONFIG as config } from './config';
import { CommandEvent, PluginEvent } from './interfaces/DEvent';
import { setup as DatabaseSetup, upgrade as DatabaseUpgrade } from './lib/Database';
import { logger } from './lib/Logger';
import { ErrorMessage as CommandError } from './lib/Responses';
import { Command } from './structures/Command';
import { Plugin } from './structures/Plugin';

let commands: { [name: string]: Command } = {}, plugins: { [name: string]: Plugin } = {};

const bot = new Eris(process.env.DISCORD_TOKEN, config.eris || {});

bot.on('ready', async () => {
	logger.info("Received 'ready' event from Discord!");
	await DatabaseSetup();
	await DatabaseUpgrade();

	if (!isReady) { // We don't want to run this again if the event is sent a second time.
		logger.verbose("Ready, loading plugins");
		let _plugins = fs.readdirSync("./plugins/");
		for (const plugin of _plugins) {
			if (plugin.startsWith("plugin_") && plugin.substring(plugin.lastIndexOf(".")) == ".js")
				load('./plugins/' + plugin);
		}

		logger.verbose("Loading commands");
		let _commands = fs.readdirSync("./commands/");
		for (const command of _commands) {
			if (command.startsWith("command_") && command.substring(command.lastIndexOf(".")) == ".js")
				load('./commands/' + command);
		}
	}

	isReady = true;
	logger.info(`Connected as ${bot.user.username} - (${bot.user.id})`);

	logger.verbose(`Connected to ${bot.guilds.size} guilds`);
	logger.debug(`Guilds:\n${bot.guilds.map((g: Guild) => {
		return `${g.id} - ${g.name}\n`
	})}`);

	let e = {
		commands: commands,
		plugins: plugins
	}
	for (let _key of Object.keys(commands)) {
		let cmd = commands[_key];

		if (!cmd.hasPostInitialized) {
			cmd.postInitialize(bot, e);
			cmd.hasPostInitialized = true;
		}
	}
	for (let _key of Object.keys(plugins)) {
		let plg = plugins[_key];

		if (!plg.hasPostInitialized) {
			plg.postInitialize(bot, e);
			plg.hasPostInitialized = true;
		}
	}
});

bot.on('error', () => { }); // Needed to have it not crash on network errors.

bot.on('messageCreate', (msg: Message<TextChannel>) => {
	if (!msg || !msg.channel) return;
	if (config.bot.ignoreBots && msg.author.bot) return;
	if (config.bot.ignoreSelf && msg.author.id == bot.user.id) return;

	if (msg.content.toLowerCase().startsWith(config.bot.prefix.toLowerCase())) {
		try {
			logger.verbose(`Message with prefix encountered!`);
			let content = msg.content.substring(config.bot.prefix.length).trim();
			let calledCommand = content.trim().split(" ")[0];
			let args = content.split(" ").splice(1);
			let hasRights = true;

			if (!(calledCommand in commands) && !findCommandForAlias(commands, calledCommand)) return;

			let command = commands[calledCommand] ? commands[calledCommand] : findCommandForAlias(commands, calledCommand);

			if (args[0] && command && (command.subcommands[args[0].toLowerCase()] || findCommandForAlias(command.subcommands, args[0].toLowerCase()))) {
				command = command?.subcommands[args[0].toLowerCase()] || findCommandForAlias(command?.subcommands, args[0].toLowerCase());
				args = args.slice(1);
			}

			if (!command) return;

			hasRights = command.canRun(msg.channel, msg.member || msg.author);

			if (!hasRights) {
				msg.addReaction("🚫");
				logger.info(`[${msg.channel.guild.name} (${msg.channel.guild.id})] User ${msg.author.username} (${msg.author.id}) was denied access to command ${calledCommand}`);
				return;
			}

			logger.info(`[${msg.channel.guild.name} (${msg.channel.guild.id})] User ${msg.author.username} (${msg.author.id}) called command ${calledCommand}`);
			logger.verbose(content);

			try {
				let e: CommandEvent = {
					commands: commands,
					plugins: plugins,
					args: args,
					executedCommand: calledCommand,
					usedPrefix: config.bot.prefix // NOTE: hardcoded to fix compatibility issues, this is currently only used in the help command.
				};

				e.member = msg.channel.guild.members.get(bot.user.id);

				let cmdRes = command.execute(bot, msg, e);
				if (cmdRes instanceof Promise) {
					cmdRes.catch(cmdError => {
						msg.channel.createMessage(CommandError("Something went wrong with that command!\nThis error has been logged."));
						logger.error(cmdError);
					});
				}
			} catch (cmdError) {
				msg.channel.createMessage(CommandError("Something went wrong with that command!\nThis error has been logged."));
				logger.error(cmdError);
			};

		} catch (cmdError) {
			msg.channel.createMessage(CommandError("Something went wrong with that command!\nThis error has been logged."));
			logger.error(cmdError);
		}
	}
});

/*
* Now that we're done with all Eris stuff
* Let's do some other stuff
* Like loading in commands
*/
function load(modulePath: string): void {
	let _module;
	try {
		_module = require(modulePath);
	} catch (err) {
		logger.error(`Failed to load module from ${modulePath}`);
		return logger.error(err);
	}
	if (!_module) {
		logger.warn(`[Loader] Module ${modulePath} has no export value.`);
		return;
	}


	let e = {
		commands: commands,
		plugins: plugins
	}

	if (_module instanceof Command) {

		if (commands[_module.name]) {
			logger.warn(`Command ${_module.name} already exists and will be overwritten.`);
			commands[_module.name].deinitialize(bot, e);
			delete commands[_module.name];
		}

		commands[_module.name] = _module;

		try {
			commands[_module.name].initialize(bot, e);
		} catch (err) {
			logger.error(`Failed to initialize command ${_module.name}`);
			return logger.error(err);
		}
		logger.verbose(`Initialized command ${_module.name}`);

		if (isReady) {
			try {
				commands[_module.name].postInitialize(bot, e);
			} catch (err) {
				logger.error(`Failed to postInitialize command ${_module.name}`);
				return logger.error(err);
			}
			commands[_module.name].hasPostInitialized = true;
		}
		logger.verbose(`Loaded command ${_module.name}`);

	} else if (_module instanceof Plugin) {
		if (plugins[_module.name]) {
			logger.warn(`Plugin ${_module.name} already exists and will be overwritten.`);
			plugins[_module.name].deinitialize(bot, e);
			delete plugins[_module.name];
		}

		plugins[_module.name] = _module;

		plugins[_module.name]._sysInit(bot, e);
		try {
			plugins[_module.name].initialize(bot, e);
		} catch (err) {
			logger.error(`Failed to initialize plugin ${_module.name}`)
			return logger.error(err);
		}
		logger.verbose(`Initialized plugin ${_module.name}`);

		if (isReady) {
			try {
				plugins[_module.name].postInitialize(bot, e);
			} catch (err) {
				logger.error(`Failed to postInitialize plugin ${_module.name}`);
				return logger.error(err);
			}
			plugins[_module.name].hasPostInitialized = true;
		}
		logger.verbose(`Loaded plugin ${_module.name}`);

	} else {
		logger.warn(`MODULE_LOADER_WARNING: ${modulePath} does NOT extend Plugin or Command.`);
		return;
	}
}

logger.info("Starting Discord connection...");
bot.connect();

process.on('SIGINT', () => {
	logger.verbose("SIGINT called, finishing up process.");
	bot.disconnect({ reconnect: false });
	process.exit();
});

process.on('exit', () => {
	let e: PluginEvent = {
		commands: commands,
		plugins: plugins
	}

	for (let i = 0; i < Object.keys(commands).length; i++) {
		let _command = commands[Object.keys(commands)[i]];
		if (_command && _command.deinitialize && typeof _command.deinitialize == 'function') {
			_command.deinitialize(bot, e);
			logger.verbose(`Deinitialized command ${_command.name}`);
		}
	}
	for (let i = 0; i < Object.keys(plugins).length; i++) {
		let _plugin = plugins[Object.keys(plugins)[i]];
		if (_plugin && _plugin && _plugin.deinitialize && typeof _plugin.deinitialize == 'function') {
			_plugin.deinitialize(bot, e);
			_plugin._sysDeinit(bot, e);
			logger.verbose(`Deinitialized plugin ${_plugin.name}`);
		}
	}

	logger.verbose("Exiting...");
});


function findCommandForAlias(head: { [name: string]: Command }, alias: string) {
	for (let key of Object.keys(head)) {
		if (head[key].aliases.includes(alias))
			return head[key];
	}
	return null;
}