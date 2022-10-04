import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import Command from "src/Structures/Command";
import { logging } from "../../Structures/Helpers/Logging";
import { developers } from "../../../config.json";

const cmd: Command = {
	displayName: "Exit",
	build: new SlashCommandBuilder().setName("exit").setDescription("Shutdown the bot, mostly for debugging"),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction, Beagle) {
		if (Math.random() >0.5) throw new Error("You hit the Unlucky chance")
		if (developers.includes(interaction.user.id)) {
			logging.debug(`User ID invalid`);
			await interaction.reply("you do not have perms");
			return;
		}
		let totalSeconds = Beagle.uptime / 1000;
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);
		logging.info(`client uptime was ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`);
		await interaction.reply(`Exiting gracefully...`);
		logging.debug("destroying client");
		Beagle.destroy();
		logging.debug("Exiting process");
        logging.info(`Goodnight`)
		process.exit(0);
	},
};
export default cmd;
