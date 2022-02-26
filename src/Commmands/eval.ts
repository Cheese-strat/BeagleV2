import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "src/Structures/Command";
import { transpile } from "typescript";
import { inspect } from "util";

const cmd: Command = {
	displayName: "Eval",
	build: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("eval code")
		.addStringOption(option => option.setName("input").setDescription("the code to run").setRequired(true)),
	cooldown: 2,
	async execute(interaction, _Beagle) {
		async function clean(Input: any) {
			if (Input instanceof Promise) Input = await Input;
			if (typeof Input !== "string") Input = inspect(Input, { depth: 0 });

			Input = Input.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

			return Input;
		}
		if (interaction.user.id !== "625149330348703744") {
			interaction.reply("you do not have perms");
			return;
		}
		const Input = interaction.options.getString("input");
		//?.replace(/.*```\w*\s*(.*)\s*```.*/s, "$1").replace(/[“”‘’]/g, '"').trim();
		if (!Input) {
			console.log("!ono");
			return;
		}
		const language = interaction.options
			.getString("input")
			?.replace(/.*```(ts|js)?\n.*\s*```.*/s, "$1")
			.trim();
		let toEval: string;
		switch (true) {
			case Input.includes("await"):
				toEval = `(async() => {${Input}})()`;
				break;
			case Input.includes("return"):
				toEval = `(() => {${Input}})()`;
				break;
			default:
				toEval = Input;
				break;
		}
		if (language === "ts") toEval = transpile(Input);
		let evaledOutput;
		const StartTime = process.hrtime();
		try {
			evaledOutput = await eval(toEval);
			evaledOutput = await clean(evaledOutput);
		} catch (e) {
			if (e instanceof Error) {
				return interaction.reply(`error:${e.message}`);
			}
			return interaction.reply(`error:${e}`);
		}
		const EvalTime = process.hrtime(StartTime);
		const FormattedTime = `${(EvalTime[0] * 1e9 + EvalTime[1] / 1e6).toFixed(2)}ms`;

		return interaction.reply(
			`**Output:**\n\`\`\`js\n${evaledOutput.length < 1950 ? evaledOutput : evaledOutput.slice(1950)}\`\`\`Time: **- ${FormattedTime}**`,
		);
	},
};
export default cmd;
