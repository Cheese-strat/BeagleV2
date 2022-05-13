import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "src/Structures/Command";
import data from "./wheel-data.json";

const cmd: Command = {
	displayName: "Wheel",
	cooldown: 2,
	build: new SlashCommandBuilder()
		.setName("wheel")
		.setDescription("Spins the wheel for your favourite game!")
		.addSubcommand(subcommand => subcommand.setName("phasmophobia").setDescription("get a random phas item"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("apex")
				.setDescription("APE THEM JOHN!")
				.addStringOption(option =>
					option
						.setName("category")
						.setDescription("catfield")
						.setRequired(false)
						.addChoice("Legend", "leg")
						.addChoice("Weapon", "gun"),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("dbd")
				.setDescription("swing and a miss")
				.addStringOption(option =>
					option
						.setName("category")
						.setDescription("catfield")
						.setRequired(true)
						.addChoice("Killer", "killer")
						.addChoice("Survivor", "surv"),
				),
		),

	async execute(interaction) {
		let res = "";
		if (interaction.options.getSubcommand() === "phasmophobia") {
			res = data.phasmophobia[Math.floor(Math.random() * data.phasmophobia.length)];
			return interaction.reply(res);
		}

		//const secondaryCat = msg.args[1];
        console.log(interaction.options)
        console.log(interaction.options.getString("category"))
		if (interaction.options.getSubcommand() === "dbd") {
			
				if (interaction.options.getString("category")==="killer") {
					//random from list of surv perks
					res = data.dbd.survivor[Math.floor(Math.random() * data.dbd.survivor.length)];
					return interaction.reply(res);
				}
				if (interaction.options.getString("category")==="surv") {
					//random from list of killer perks
					res = data.dbd.killer[Math.floor(Math.random() * data.dbd.killer.length)];
					return interaction.reply(res);
				}
			
			//random from conjoined list
			res = ":)";
			return interaction.reply(res);
		}

		if (interaction.options.getSubcommand() ==="apex") {
			if (interaction.options.getString("category")) {
				if (interaction.options.getString("category")==="leg") {
					//random from list of legends
					res = data.apex.characters[Math.floor(Math.random() * data.apex.characters.length)];
					return interaction.reply(res);
				}
				if (interaction.options.getString("category")==="gun") {
					//random from list of guns
					res = data.apex.weapons[Math.floor(Math.random() * data.apex.weapons.length)];
					return interaction.reply(res);
				}
			}
			//random from one each
			res = `Character: ${data.apex.characters[Math.floor(Math.random() * data.apex.characters.length)]}\n`;
			res += `Weapon: ${data.apex.weapons[Math.floor(Math.random() * data.apex.weapons.length)]}`;
		}
		return interaction.reply(res);
	},
};
export default cmd;
