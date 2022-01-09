import { MessageContent } from "eris"
import { MANIFEST as VIEW_MANIFEST } from "../Constants"
import { Manifest, VersionRegion, View } from "../interfaces/API"

export function ErrorMessage(errorMessage: string, title?: string) {
	return {
		content: "",
		embed: {
			title: title || "Error",
			description: errorMessage,
			color: 0x8b1f1f
		}
	}
}

export function OKMessage(okMessage: string, title?: string) {
	return {
		content: "",
		embed: {
			title: title || "OK",
			description: okMessage,
			color: 0x1f8b4c
		}
	}
}


// GameVersion takes an array of versions, one entry for each region.
export function GameVersion(game: Manifest<VersionRegion>): MessageContent {
	return {
		content: "",
		embed: {
			title: `New ${game.name} version`,
			url: VIEW_MANIFEST(game.product, 'versions', game.seqn),
			description: `A new version for ${game.name} is available.`,
			fields: game.data.map(ver => {
				return {
					name: ver.region_name,
					value: `${ver.versionsname} (${ver.buildid})`
				}
			}),
			footer: {
				text: "Indexed"
			},
			timestamp: new Date(game.indexed) // Have the discord client decide which timezone to show :)
		}
	};
}

