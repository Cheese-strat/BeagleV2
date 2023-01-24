import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "src/Structures/Command";
import { exec } from "child_process"
import { logging } from "../../Structures/Helpers/Logging";

const cmd: Command = {
	displayName: "Server",
	cooldown: 2,
	build: new SlashCommandBuilder()
		.setName("startup")
		.setDescription("Spins the wheel for your favourite game!"),

	async execute(interaction: ChatInputCommandInteraction) {
		logging.info("starting minecraft server");
		try {
			exec("startMcServer.sh")
		} catch (error) {
			logging.error((error as Error).message);
			interaction.reply("Something went wrong, please message paul or ben")
			return
		}
		logging.info("server started");
		interaction.reply(`Starting up now :)`);
		return;
	},
};
export default cmd;
