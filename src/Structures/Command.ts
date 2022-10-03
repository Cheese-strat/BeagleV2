//import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import BeagleClient from "./Client";

export default interface Command {
	displayName: string;
    internalName?:Lowercase<string>;
	cooldown: number;
	category?: string;
	execute(interaction: ChatInputCommandInteraction<"cached"|"raw">,Client:BeagleClient<true>): Promise<void>;
    build:any
}