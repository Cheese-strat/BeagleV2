import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../Structures/Command";


const cmd: Command = {
	displayName: "Skip",
	build: new SlashCommandBuilder().setName("skip").setDescription("skip"),
	cooldown: 1,
	async execute(interaction, Beagle) {
		let member = interaction.member;
		if (!member ||"joined_at" in member) {
			const guild = await Beagle.guilds.fetch(interaction.guildId!);
			member = await guild.members.fetch(interaction.user.id)
        }
        if (!member.voice.channel){
			interaction.reply("I cant find the voice channel your in.");
			return;
		}
		const player = Beagle.music.get(member.guild.id);
		if (!player) return interaction.reply("There is nothing playing in this server.");

		if (member.voice.channel.id !== player.voiceChannel) return interaction.reply("you're not in the same voice channel.");

		if (!player.queue.current) return interaction.reply("there is no music playing.");

		const { title } = player.queue.current;

		player.stop();
		return interaction.reply(`${title} was skipped.`);
	},
};

export default cmd;
