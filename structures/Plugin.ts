import { Client } from "eris";
import { CommandOptions } from "../interfaces/CommandOptions";
import { PluginEvent } from "../interfaces/DEvent";
import { EventHandler } from "../interfaces/EventHandler";

export class Plugin {
	public readonly name: string;

	private client?: Client;
	private eventHandlers: { [event: string]: EventHandler[] } = {};
	private hasSysInitialized = false
	public hasPostInitialized: boolean = false;

	constructor(name: string, options: CommandOptions) {
		if (!name)
			throw new Error("Plugin name cannot be empty.");
		options = options || {};
		this.name = name;
	}

	initialize(client: Client, e: PluginEvent) { }
	postInitialize(client: Client, e: PluginEvent) { }
	deinitialize(client: Client, e: PluginEvent) { }

	_sysInit(client: Client, e: PluginEvent) {
		this.client = client;
		for (const key of Object.keys(this.eventHandlers))
			for (let handler of this.eventHandlers[key])
				client.on(key, handler);
		this.hasSysInitialized = true;
	}

	_sysDeinit(client: Client, e: PluginEvent) {
		this.client = undefined;
		for (const key of Object.keys(this.eventHandlers))
			for (let handler of this.eventHandlers[key])
				client.removeListener(key, handler);
		this.hasSysInitialized = false;
	}

	registerHandler(event: string, handler: EventHandler) {
		if (!(event in this.eventHandlers))
			this.eventHandlers[event] = [];
		this.eventHandlers[event].push(handler);
		if (this.hasSysInitialized)
			this.client?.on(event, handler);
	}

}
