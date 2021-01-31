import { MessageContent } from "eris";
import { CommandOptions } from '../interfaces/CommandOptions';
import { Command } from "./Command";

export interface Page {
	hasNext: boolean,
	hasPrevious: boolean,
	currentPage: number,
	content: MessageContent
}

export class PageCommand extends Command {

	constructor(name: string, options: CommandOptions) {
		super(name, options);
	}

	// Page is 0-index based
	paginate(author: string, channel: string, page: number, data?: any): Page | Promise<Page> {
		return {
			hasNext: false,
			hasPrevious: false,
			currentPage: 0,
			content: ''
		};
	}

}