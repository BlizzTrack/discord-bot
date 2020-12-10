import Eris, { MessageContent } from "eris"
import { MANIFEST } from "../Constants"
import { VersionRegion, View } from "../interfaces/API"

export function ErrorMessage(errorMessage: string) {
	return {
		content: "",
		embed: {
			title: "Error",
			description: errorMessage,
			color: 0x8b1f1f
		}
	}
}

export function OKMessage(okMessage: string) {
	return {
		content: "",
		embed: {
			title: "OK",
			description: okMessage,
			color: 0x1f8b4c
		}
	}
}


// GameVersion takes an array of versions, one entry for each region.
export function GameVersion(game: View<VersionRegion>): MessageContent {
	return {
		content: "",
		embed: {
			title: `New ${game.name} version`,
			url: MANIFEST(game.code, 'versions', game.seqn),
			description: `A new version for ${game.name} is available.`,
			fields: game.data.map(ver => {
				return {
					name: ver.region_name,
					value: `${ver.versionsname} (${ver.buildid})`
				}
			})
		}
	};
}

