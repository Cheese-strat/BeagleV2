import { SlashCommandBuilder } from "@discordjs/builders";
import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Command from "src/Structures/Command";
import axios from "axios";
import Jimp from "jimp";
import config from "../../../config.json";
import { dbd } from "./game-data.json";
const api_base = `https://dbd.tricky.lol/api/`;
import { logging } from "../../Structures/Helpers/Logging";
const logger = logging.getLogger("Commands.Games.DBD");

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
				logger.info("Axios request returned void");
				return;
			}
			const shrine_res: shrine_result = response.data;

			let perks = shrine_res.perks.map(({ id }, index) => {
				///@ts-ignore
				let perkData = dbd.perks.find(element => element.api_name === id); // as perkInfo_result;
				if (!perkData) {
					logger.info(`Perk ID not found: ${id}`);
					return false;
				}

				//"R:\\Programming\\testing-and-scripts\\PerkIcons\\IconPerks_scourgeHookFloodsOfRage.png"
				let value = {
					icon_path: config.shrineImgPaths.iconFolder + perkData.path,
					//gets written later
					icon: undefined,
					x: 0,
					y: 0,
					perkname: perkData.name,
					text: "",
				};
				if (index === 0) {
					value.x = 20;
					value.y = 20;
				}
				if (index === 1) {
					value.x = 20;
					value.y = 650;
				}
				if (index === 2) {
					value.x = 1500;
					value.y = 20;
				}
				if (index === 3) {
					value.x = 1500;
					value.y = 650;
				}
				return value;
			});
			if (!isPerksArray(perks)) {
				await interaction.editReply("Sorry there was a problem with the command");
				return;
			}
			const ShrineEmbed = new EmbedBuilder()
				.setTitle("Current Shrine Rotation")
				.setFooter({ text: `The shrine will reset at: ` })
				.setTimestamp(shrine_res.end * 1000);
			const shrine_img = await MakeShrineImage(config.shrineImgPaths, perks[0], perks[1]!, perks[2]!, perks[3]!);
			//Saves the image into the file system
			await shrine_img.writeAsync(config.shrineImgPaths.endPath);
			const file = new AttachmentBuilder("./current_shrine.png");
			ShrineEmbed.setImage("attachment://current_shrine.png");
			await interaction.editReply({
				embeds: [ShrineEmbed],
				files: [file],
			});
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
// interface perkInfo_result {
// 	name: string;
// 	description: string;
// 	isSurvivor: boolean;
// 	character: number;
// 	api_name: string;
// 	path: string;
// }
interface PathsOBJ {
	background: string;
	boldFont: string;
	lightFont: string;
	perkIconBackground: string;
	endPath: string;
	iconFolder: string;
}
interface perk {
	icon_path: string;
	icon: undefined | Jimp;
	x: number;
	y: number;
	perkname: string;
	text: string;
}
function isPerksArray(array: (perk | false)[]): array is perk[] {
	return !array.includes(false);
}
async function MakeShrineImage(bg_paths: PathsOBJ, perk1: perk, perk2: perk, perk3: perk, perk4: perk): Promise<Jimp> {
	const background_image = await Jimp.read(bg_paths.background);
	const Boldfont = await Jimp.loadFont(bg_paths.boldFont);
	const lightfont = await Jimp.loadFont(bg_paths.lightFont);
	// reads the watermark image
	let perk_icon_bg = await Jimp.read(bg_paths.perkIconBackground);
	// resizes the watermark image
	perk_icon_bg = await perk_icon_bg.resize(400, 400);
	// reads the image

	//perk1 top left
	perk1.icon = await Jimp.read(perk1.icon_path);
	background_image.print(Boldfont, perk1.x + 220, perk1.y, perk1.perkname);
	if (perk1.text !== "") background_image.print(lightfont, perk1.x + 270, perk1.y + 50, perk1.text);

	background_image.composite(perk_icon_bg, perk1.x, perk1.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	perk1.icon = await perk1.icon.resize(400, 400);
	background_image.composite(perk1.icon, perk1.x, perk1.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	//perk2 bottom left
	perk2.icon = await Jimp.read(perk2.icon_path);
	background_image.print(Boldfont, perk2.x + 220, perk2.y, perk2.perkname);
	if (perk2.text !== "") background_image.print(lightfont, perk2.x + 270, perk2.y + 50, perk2.text);

	background_image.composite(perk_icon_bg, perk2.x, perk2.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	perk2.icon = await perk2.icon.resize(400, 400);
	background_image.composite(perk2.icon, perk2.x, perk2.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	//perk3 top right
	perk3.icon = await Jimp.read(perk3.icon_path);
	background_image.print(
		Boldfont,
		0,
		0,
		{
			text: perk3.perkname,
			alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
			alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
		},
		perk3.x + 100,
		perk3.y + 350,
	);
	if (perk3.text !== "")
		background_image.print(
			lightfont,
			0,
			0,
			{
				text: perk3.text,
				alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
				alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
			},
			perk3.x + 150,
			perk3.y + 400,
		);

	background_image.composite(perk_icon_bg, perk3.x, perk3.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	perk3.icon = await perk3.icon.resize(400, 400);
	background_image.composite(perk3.icon, perk3.x, perk3.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	//perk4 bottom right
	perk4.icon = await Jimp.read(perk4.icon_path);
	background_image.print(
		Boldfont,
		0,
		0,
		{
			text: perk4.perkname,
			alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
			alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
		},
		perk4.x + 100,
		perk4.y + 350,
	);

	if (perk4.text !== "")
		background_image.print(
			lightfont,
			0,
			0,
			{
				text: perk4.text,
				alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
				alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
			},
			perk4.x + 150,
			perk4.y + 400,
		);

	background_image.composite(perk_icon_bg, perk4.x, perk4.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	perk4.icon = await perk4.icon.resize(400, 400);
	background_image.composite(perk4.icon, perk4.x, perk4.y, {
		mode: Jimp.BLEND_SOURCE_OVER,
		opacityDest: 1,
		opacitySource: 1,
	});

	return background_image;
}
