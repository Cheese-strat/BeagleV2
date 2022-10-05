import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, ChatInputCommandInteraction } from "discord.js";
import Command from "src/Structures/Command";
import { transpile } from "typescript";
import { inspect } from "util";
import { logging } from "../../Structures/Helpers/Logging";
import { developers } from "../../../config.json";

const cmd: Command = {
	displayName: "Eval",
	build: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("eval code")
		.addStringOption(option => option.setName("input").setDescription("the code to run").setRequired(true)),
	cooldown: 2,
	async execute(interaction: ChatInputCommandInteraction, Beagle) {
		async function clean(Input: any) {
			logging.debug(`Input type: ${typeof Input}, toString value: ${Input.toString()}`);
			if (Input instanceof Promise) Input = await Input;
			if (typeof Input !== "string") Input = inspect(Input, { depth: 0 });

			Input = Input.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			logging.debug(`formatted string value: ${Input}`);
			return Input;
		}
		if (!developers.includes(interaction.user.id)) {
			logging.debug(`User ID invalid`);
			await interaction.reply("you do not have perms");
			return;
		}
		let Input = interaction.options.getString("input");
		if (!Input) {
			logging.error("string option not present");
			return;
		}
		async function GetMessage(messageID: string, channelID: string) {
			logging.debug(`messageID: ${messageID}, channelID: ${channelID}`);
			const channel = await Beagle.channels.fetch(channelID);
			if (!channel) {
				logging.warn(`channel not found ID: ${channelID}`);
				return false;
			}
			logging.debug(`channel type: ${channel.type}`);
			if (channel.type === ChannelType.GuildText) {
				return await channel.messages.fetch(messageID);
			}
			return false;
		}
		if (Input.match(/^\d+$/)) {
			const message = await GetMessage(Input, interaction.channelId);
			if (!message) {
				interaction.reply("There was no message found with that ID in this channel");
				return;
			}
			Input = message.content;
			logging.debug("Reassigned Input to referenced message");
		}
		if (Input.startsWith("https://discord.com/channels/")) {
			let IDarray = Input.slice(29).split("/");
			if (IDarray.length >= 2) {
				IDarray = IDarray.slice(-2, IDarray.length);
				const message = await GetMessage(IDarray[1], IDarray[0]);
				if (!message) {
					interaction.reply("There was no message found with that ID");
					return;
				}
				Input = message.content;
				logging.debug("Reassigned Input to referenced message link");
			}
		}

		Input = Input.replace(/.*```\w*\s*(.*)\s*```.*/s, "$1")
			.replace(/[“”‘’]/g, '"')
			.trim();

		const language = interaction.options
			.getString("input")
			?.replace(/.*```(ts|js)?\n.*\s*```.*/s, "$1")
			.trim();

		let toEval: string;

		if (Input.includes("await")) {
			toEval = `(async() => {${Input}})()`;
		} else if (Input.includes("return")) {
			toEval = `(() => {${Input}})()`;
		} else {
			toEval = Input;
		}
		logging.info("transpiling typescript");
		if (language === "ts") toEval = transpile(Input);
		let evaledOutput;
		const StartTime = process.hrtime();
		try {
			evaledOutput = await eval(toEval);
			evaledOutput = await clean(evaledOutput);
		} catch (e) {
			logging.info("error was caught");
			if (e instanceof Error) {
				interaction.reply(`error:${e.message}`);
				return;
			}
			interaction.reply(`error:${e}`);
			return;
		}
		const EvalTime = process.hrtime(StartTime);
		const FormattedTime = `${(EvalTime[0] * 1e9 + EvalTime[1] / 1e6).toFixed(2)}ms`;
		logging.info(`eval time was ${FormattedTime}`);
		interaction.reply(`**Output:**\n\`\`\`js\n${evaledOutput.length < 1950 ? evaledOutput : evaledOutput.slice(1950)}\`\`\`Time: **- ${FormattedTime}**`);
		return;
	},
};
export default cmd;
