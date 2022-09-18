import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Command from "src/Structures/Command";
import axios from "axios";
const api_base = `https://dbd.tricky.lol/api/`;

const cmd: Command = {
	displayName: "dbd",
	build: new SlashCommandBuilder()
		.setName("dbd")
		.setDescription("dbd lololol")
		.addSubcommand(subcommand => subcommand.setName("shrine").setDescription("Get the currently active shrine")),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getSubcommand() === `shrine`) {
			await interaction.deferReply();
			const response = await axios.get(`${api_base}shrine`).catch(error => {
				console.error(error);
			});
			if (!response) {
				console.log("Axios request returned void");
				return;
			}
			const shrine_res: shrine_result = response.data;
			let fields = [];
			for (let perkData of shrine_res.perks) {
				let field = {
					name: "",
					value: "",
					inline: true,
				};

				const response = await axios.get(`${api_base}perkinfo?perk=${perkData.id}`).catch(error => {
					console.error(error);
				});

				if (!response) {
					console.log("Axios request returned void");
					return;
				}
				const perkInfo_res: perkInfo_result = response.data;

				field.name = perkInfo_res.name;
				field.value = `${perkInfo_res.role} perk`;
				fields.push(field);

				
			}
			fields.splice(2, 0, {
				name: "\u200B",
				value: "\u200B",
				inline: false,
			});
			const ShrineEmbed = new EmbedBuilder()
				.setTitle("Current Shrine Rotation")
				.addFields(fields)
				.setFooter({ text: `The shrine will reset at: ` })
				.setTimestamp(shrine_res.end);
				

			await interaction.editReply({ embeds: [ShrineEmbed] });
			return;
		}
		interaction.reply(`a biblioteca é engraçada.`);
		return;
	},
};
export default cmd;

interface shrine_result {
	id: number;
	perks: [
		{
			id: string;
			bloodpoints: number;
			shards: number;
		},
		{
			id: string;
			bloodpoints: number;
			shards: number;
		},
		{
			id: string;
			bloodpoints: number;
			shards: number;
		},
		{
			id: string;
			bloodpoints: number;
			shards: number;
		},
	];
	start: number;
	end: number;
}
interface perkInfo_result {
	id: string;
	categories: string[];
	name: string;
	description: string;
	role: string;
	character: number;
	tunables: [string, string, string][];
	modifier: string;
	teachable: number;
	image: string;
}
