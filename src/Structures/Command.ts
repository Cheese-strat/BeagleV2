//import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import BeagleClient from "./Client";

export default interface Command {
	displayName: string;
    internalName?:Lowercase<string>
	cooldown: number;
	execute(interaction: CommandInteraction,Client:BeagleClient<true>): Promise<void>;
    build:any
}