import { CommandInteraction } from "discord.js";

export default interface Command {
	displayName: string;
	description: string;
	args: {
		required: boolean;
		case: boolean;
		name: string;
	}[];
	cooldown: number;
	execute(interaction: CommandInteraction): void;
}
