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