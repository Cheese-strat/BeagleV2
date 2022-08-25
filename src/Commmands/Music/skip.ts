import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../../Structures/Command";

const cmd: Command = {
	displayName: "Skip",
	build: new SlashCommandBuilder().setName("skip").setDescription("Skips the current song"),
	cooldown: 1,
	async execute(interaction, Beagle) {
//TODO rewrite as if else chain

		let member = interaction.member;
		if (!member || "joined_at" in member) {
			const guild = await Beagle.guilds.fetch(interaction.guildId!);
			member = await guild.members.fetch(interaction.user.id);
		}

		if (!member.voice.channel) {
			interaction.reply("I cant find the voice channel your in.");
			return;
		}
		const player = Beagle.music.get(member.guild.id);
		if (!player) {
			interaction.reply("There is nothing playing in this server.");
			return;
		}

		if (member.voice.channel.id !== player.voiceChannel) {
			interaction.reply("you're not in the same voice channel.");
			return;
		}

		if (!player.queue.current) {
			interaction.reply("there is no music playing.");
			return;
		}

		const { title } = player.queue.current;

		player.stop();
		interaction.reply(`${title} was skipped.`);
		return;
	},
};

export default cmd;

