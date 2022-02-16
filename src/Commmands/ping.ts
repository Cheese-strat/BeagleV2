import Command from "src/Structures/Command";

/*export default {
	data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
	async execute(interaction: CommandInteraction) {
		await interaction.reply("Pong!");
	},
};*/
const cmd: Command = {
	displayName: "Ping",
	description: "Pings the bot and the discord API to test reaction time and latency",
	args: [
		{
			required: false,
			case: false,
			name: "",
		},
	],
	cooldown: 2,
	execute(interaction) {
		interaction.reply("Ping pong :)");
		return;
	},
};
export default cmd;
