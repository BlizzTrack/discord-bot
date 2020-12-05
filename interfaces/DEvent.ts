import { Member } from "eris";
import { Command } from "../structures/Command";
import { Plugin } from "../structures/Plugin";

export interface CommandEvent {
	commands: { [name: string]: Command },
	plugins: { [name: string]: Plugin },
	args: string[],
	executedCommand: string,
	usedPrefix: string,
	member?: Member
}

export interface PluginEvent {
	commands: { [name: string]: Command },
	plugins: { [name: string]: Plugin },
}