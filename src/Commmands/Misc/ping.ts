import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "src/Structures/Command";

const cmd: Command = {
	displayName: "ping",
	build: new SlashCommandBuilder().setName("ping").setDescription("Pings the bot and the discord API to test reaction time and latency"),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction) {
		interaction.reply("pinging...");
		const message = await interaction.fetchReply();
		let ping: number;

		ping = message.createdTimestamp - interaction.createdTimestamp;

		interaction.editReply(`Pong! Latency is ${ping}ms.`);

		return;
	},
};
export default cmd;
