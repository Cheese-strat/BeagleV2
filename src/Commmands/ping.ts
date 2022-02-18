import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "src/Structures/Command";

const cmd: Command = {
	displayName: "Ping",
	build: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pings the bot and the discord API to test reaction time and latency"),
	cooldown: 2,
	async execute(interaction) {
		interaction.reply("pinging...");
		const message = await interaction.fetchReply();
		let ping: number;
		if ("createdTimestamp" in message) {
			ping = interaction.createdTimestamp - message.createdTimestamp;
		} else {
			ping = interaction.createdTimestamp - Number(message.timestamp);
		}
		interaction.editReply(`Pong! Latency is ${ping}ms.`);

		return;
	},
};
export default cmd;
