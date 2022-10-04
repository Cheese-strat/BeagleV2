import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "src/Structures/Command";
import { logging } from "../../Structures/Helpers/Logging";

const cmd: Command = {
	displayName: "ping",
	build: new SlashCommandBuilder().setName("ping").setDescription("Pings the bot and the discord API to test reaction time and latency"),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("pinging...");
		const message = await interaction.fetchReply();
		logging.debug(`Message ID: ${message.id}, Channel ID: ${message.channel.id}`);
		let ping: number;
		logging.debug(`Reply Timestamp: ${message.createdTimestamp}, Interaction Timestamp: ${interaction.createdTimestamp}`);
		ping = message.createdTimestamp - interaction.createdTimestamp;

		interaction.editReply(`Pong! Latency is ${ping}ms.`);
		return;
	},
};
export default cmd;
