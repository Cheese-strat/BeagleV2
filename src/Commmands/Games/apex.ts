import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Command from "src/Structures/Command";
import wheel_data from "./wheel-data.json";
import axios from "axios";
import config from "../../../config.json";

const cmd: Command = {
	displayName: "apex",
	cooldown: 2,
	build: new SlashCommandBuilder()
		.setName("apex")
		.setDescription("Get Info about apex")
		.addSubcommand(subcommand =>
			subcommand
				.setName("dropspot")
				.setDescription("Gets a random drop spot")
				.addStringOption(option =>
					option
						.setName("map")
						.setDescription("The map to drop into")
						.setRequired(true)
						.addChoices(
							{ name: "Worlds Edge", value: "Worlds Edge" },
							{ name: "Storm Point", value: "Storm Point" },
							{ name: "King's Canyon", value: "King's Canyon" },
						),
				),
		)

		.addSubcommand(subcommand =>
			subcommand
				.setName("map")
				.setDescription("Gets the current map rotation")
				.addStringOption(option =>
					option
						.setName("gamemode")
						.setDescription("The Gamemode")
						.setRequired(true)
						.addChoices(
							{ name: "Battle Royale", value: "pubs" },
							{ name: "Ranked Leagues", value: "rankedbr" },
							{ name: "Arenas", value: "arenas" },
							{ name: "Ranked Arenas", value: "rankedarenas" },
						),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("random")
				.setDescription("You can make explosives from peanuts!")
				.addStringOption(option =>
					option
						.setName("type")
						.setDescription("Legend or Weapon")
						.setRequired(true)
						.addChoices({ name: "Weapon", value: "gun" }, { name: "Apex Legend", value: "legend" }),
				),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		let res = "";
		if (interaction.options.getSubcommand() === "random") {
			if (interaction.options.getString("type") === "gun") {
				res = wheel_data.apex.weapons[Math.floor(Math.random() * wheel_data.apex.weapons.length)];
				interaction.reply(res);
				return;
			}
			if (interaction.options.getString("type") === "legend") {
				res = wheel_data.apex.characters[Math.floor(Math.random() * wheel_data.apex.characters.length)];
				interaction.reply(res);
				return;
			}
		}
		if (interaction.options.getSubcommand() === "dropspot") {
			const chosenMap = interaction.options.getString("map") as "Worlds Edge" | "Storm Point" | "King's Canyon";

			res = wheel_data.apex.Maps[chosenMap][Math.floor(Math.random() * wheel_data.apex.Maps[chosenMap].length)];
			interaction.reply(res);
			return;
		}
		//const secondaryCat = msg.args[1];
		if (interaction.options.getSubcommand() === "map") {
			await interaction.deferReply();
			const response = await axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${config.ApexStatusToken}`).catch(error => {
				console.error(error);
			});
			if (!response) {
				console.log("Axios request returned void");
				return;
			}
			const data: API_Res = response.data;
			const MapEmbed = new EmbedBuilder().setTitle("Current Map Rotation");

			if (interaction.options.getString("gamemode") === "pubs") {
				///@ts-ignore
				const wikiLink = WikiLinkMap[data.battle_royale.current.code];
				if (wikiLink !== undefined) MapEmbed.setURL(wikiLink);
				MapEmbed.setDescription(data.battle_royale.current.map)
					.setImage(data.battle_royale.current.asset)
					.setFooter({ text: `The Next map is ${data.battle_royale.next.map}` });

				await interaction.editReply({ embeds: [MapEmbed] });
				return;
			}
			if (interaction.options.getString("gamemode") === "rankedbr") {
				///@ts-ignore
				const wikiLink = WikiLinkMap[data.ranked.current.code];
				if (wikiLink !== undefined) MapEmbed.setURL(wikiLink);
				MapEmbed.setDescription(data.ranked.current.map)
					.setImage(data.ranked.current.asset)
					.setFooter({ text: `The Next map is ${data.ranked.next.map}` });

				await interaction.editReply({ embeds: [MapEmbed] });
				return;
			}
			if (interaction.options.getString("gamemode") === "arenas") {
				MapEmbed.setDescription(data.arenas.current.map)
					.setImage(data.arenas.current.asset)
					.setFooter({ text: `The Next map is ${data.arenas.next.map}` });

				await interaction.editReply({ embeds: [MapEmbed] });
				return;
			}
			if (interaction.options.getString("gamemode") === "rankedarenas") {
				MapEmbed.setDescription(data.arenasRanked.current.map)
					.setImage(data.arenasRanked.current.asset)
					.setFooter({ text: `The Next map is ${data.arenasRanked.next.map}` });

				await interaction.editReply({ embeds: [MapEmbed] });
				return;
			}
		}
	},
};
export default cmd;

const WikiLinkMap = {
	worlds_edge_rotation: "https://apexlegends.fandom.com/wiki/World's_Edge",
	kings_canyon_rotation: "https://apexlegends.fandom.com/wiki/Kings_Canyon",
	storm_point_rotation: "https://apexlegends.fandom.com/wiki/Storm_Point",
};
interface API_Res {
	battle_royale: {
		current: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
			remainingSecs: number;
			remainingMins: number;
			remainingTimer: string;
		};
		next: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
		};
	};
	arenas: {
		current: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
			remainingSecs: number;
			remainingMins: number;
			remainingTimer: string;
		};
		next: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
		};
	};
	ranked: {
		current: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
			remainingSecs: number;
			remainingMins: number;
			remainingTimer: string;
		};
		next: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
		};
	};
	arenasRanked: {
		current: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
			remainingSecs: number;
			remainingMins: number;
			remainingTimer: string;
		};
		next: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
		};
	};
	ltm: {
		current: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			eventName: string;
			asset: string;
			remainingSecs: number;
			remainingMins: number;
			remainingTimer: string;
		};
		next: {
			start: number;
			end: number;
			readableDate_start: string;
			readableDate_end: string;
			map: string;
			code: string;
			DurationInSecs: number;
			DurationInMinutes: number;
			asset: string;
		};
	};
}
