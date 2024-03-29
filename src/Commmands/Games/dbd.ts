import { SlashCommandBuilder } from "@discordjs/builders";
import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Command from "src/Structures/Command";
import axios from "axios";
import { HTMLElement, NodeType, parse } from "node-html-parser";
import Jimp from "jimp";
import config from "../../../config.json";
import { dbd } from "./game-data.json";
const trickyAPIBase = `https://dbd.tricky.lol/api/`;
import { logging } from "../../Structures/Helpers/Logging";

const cmd: Command = {
	displayName: "dbd",
	build: new SlashCommandBuilder()
		.setName("dbd")
		.setDescription("dbd lololol")
		.addSubcommand(subcommand => subcommand.setName("shrine").setDescription("Get the currently active shrine")),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction) {
		logging.debug(interaction.options.data.map(x => JSON.stringify(x)).join("\n"));
		if (interaction.options.getSubcommand() === `shrine`) {
			await interaction.deferReply();
			logging.info(`Deferred reply`);

			const response = await axios.get(`${trickyAPIBase}shrine`).catch(logging.errorUncaught);
			if (!response) {
				logging.info("Axios request returned void");
				return;
			}
			const shrine_res: shrine_result = response.data;
			//if the tricky api has expired and not updated, get the perk names from the wiki
			let WikiSOS: WikiOBJ | undefined = undefined;
			if (shrine_res.end * 1000 < Date.now()) {
				let res = await GetPerkNames();
				if (!res) logging.error("Something went wrong look up ^");
				else WikiSOS = res;
			}
			let perks = shrine_res.perks.map(({ id }, index) => {
				let perkData;
				if (WikiSOS) {
					perkData = dbd.perks.find(element => {
						//@ts-ignore dont know how to fix this
						return WikiSOS.perks[index].toLowerCase() === element.name.toLowerCase();
					});
				} else {
					
					perkData = dbd.perks.find(element => {
						
						return element.api_name.toLowerCase() === APIperkmap[id] || (element.api_name.toLowerCase() === id.toLowerCase());
					}); // as perkInfo_result;
				}

				if (!perkData) {
					logging.info(`Perk ID not found: ${id}${WikiSOS ? ` or ${WikiSOS.perks[index]}` : ""}`);
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
				logging.error(`The perk array didnt contain all perks`);
				await interaction.editReply("Sorry I couldnt Identify some of the perks");
				return;
			}

			logging.info(`Building Embed`);
			const ShrineEmbed = new EmbedBuilder().setTitle("Current Shrine Rotation");
			if (!WikiSOS) {
				ShrineEmbed.setFooter({ text: `The shrine will reset at: ` }).setTimestamp(shrine_res.end * 1000);
			} else {
				ShrineEmbed.setFooter({ text: `The shrine will reset in: ${WikiSOS.timeoutStr}` });
			}
			logging.info(`Making the shrine Image`);

			const shrine_img = await MakeShrineImage(config.shrineImgPaths, perks[0], perks[1]!, perks[2]!, perks[3]!).catch(logging.errorUncaught);
			if (!shrine_img) {
				logging.error(`shrine image failed to generate`);
				interaction.editReply(`a biblioteca é engraçada.`);
				return;
			}
			logging.debug(`jimp obj: ${shrine_img}`);
			//Saves the image into the file system
			await shrine_img.writeAsync(config.shrineImgPaths.endPath).catch(logging.errorUncaught);
			logging.info(`Written to file`);
			const file = new AttachmentBuilder("./" + config.shrineImgPaths.endPath);
			logging.debug(`file: ${file}`);
			ShrineEmbed.setImage(`attachment://${config.shrineImgPaths.endPath}`);
			logging.info(`Set the Image, attempting to edit reply`);
			await interaction
				.editReply({
					embeds: [ShrineEmbed],
					files: [file],
				})
				.catch(logging.errorUncaught);
			logging.info(`Finished editing the reply`);
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
async function MakeShrineImage(bg_paths: PathsOBJ, perk1: perk, perk2: perk, perk3: perk, perk4: perk): Promise<null | Jimp> {
	const background_image = await Jimp.read(bg_paths.background).catch(logging.errorUncaught);
	const Boldfont = await Jimp.loadFont(bg_paths.boldFont).catch(logging.errorUncaught);
	const lightfont = await Jimp.loadFont(bg_paths.lightFont).catch(logging.errorUncaught);
	// reads the watermark image
	let perk_icon_bg = await Jimp.read(bg_paths.perkIconBackground).catch(logging.errorUncaught);
	logging.info("Files loaded");
	if (!(background_image && perk_icon_bg && Boldfont && lightfont)) {
		logging.error("Image not found");
		return null;
	}
	// resizes the watermark image
	perk_icon_bg = await perk_icon_bg.resize(400, 400);
	// reads the image

	//perk1 top left
	perk1.icon = await Jimp.read(perk1.icon_path);
	logging.debug(`icon 1: ${perk1.icon}`);
	if (!perk1.icon) {
		logging.error("Image not found");
		return null;
	}
	background_image.print(Boldfont, perk1.x + 250, perk1.y, perk1.perkname);
	if (perk1.text !== "") background_image.print(lightfont, perk1.x + 300, perk1.y + 50, perk1.text);

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
	logging.debug(`icon 2: ${perk2.icon}`);
	if (!perk2.icon) {
		logging.error("Perk 2, icon not found");
		return null;
	}
	background_image.print(Boldfont, perk2.x + 250, perk2.y, perk2.perkname);
	if (perk2.text !== "") background_image.print(lightfont, perk2.x + 300, perk2.y + 50, perk2.text);

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
	logging.debug(`icon 3: ${perk3.icon}`);
	if (!perk3.icon) {
		logging.error("Perk 3, icon not found");
		return null;
	}
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
	logging.debug(`icon 4: ${perk4.icon}`);
	if (!perk4.icon) {
		logging.error("Perk 4, icon not found");
		return null;
	}
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
	logging.info("Made shrine Image");
	return background_image;
}
interface WikiOBJ {
	perks: string[];
	timeoutStr: string;
}
async function GetPerkNames(): Promise<false | WikiOBJ> {
	///@ts-ignore
	const response = await axios.get(`https://deadbydaylight.fandom.com/wiki/Shrines_of_Secrets_Archive`);
	if (!response) {
		console.info("Axios request returned void");
		return false;
	}
	try {
		const root = parse(response.data);

		const sos = root.querySelector("#mw-content-text > div > center:nth-child(6) > table > tbody > tr:nth-child(2) > td > div");
		if (!sos) {
			logging.error("no sos found");
			return false;
		}
		var arr = sos.querySelectorAll(".sosPerk").map(node => {
			let elem = node.childNodes.filter(myNode => myNode.nodeType === NodeType.ELEMENT_NODE)[0] as HTMLElement;
			return elem.attrs.title;
		});
		var shrineTimout = root.querySelector("#mw-content-text > div > center:nth-child(6) > table > tbody > tr:nth-child(4) > th > span");
		if (!shrineTimout) {
			logging.error("no timeout found");
			return false;
		}
	} catch (err) {
		if (err instanceof Error) logging.errorUncaught(err);
		throw new Error(`err was of type: ${typeof err}`);
	}
	return { perks: arr, timeoutStr: shrineTimout.innerText };
}

 const APIperkmap:{[mapval: string]:string} = {
	"Sprint_Burst":"sprintburst"
 }