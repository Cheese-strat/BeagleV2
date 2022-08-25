///@ts-nocheck
import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import Command from "src/Structures/Command";

const cmd: Command = {
	displayName: "np",
	build: new SlashCommandBuilder().setName("nowplaying").setDescription("Shows the currently playing song"),
	cooldown: 2,
	async execute(interaction, Beagle) {
		//@ts-ignore
		const channel = interaction.member?.voice?.channel;
		console.log(interaction.member);
		if (!channel) {
			interaction.reply("I cant find the voice channel your in.");
			return;
		}

		// if your adding another song to the queue (no need to make a player)
		let player = Beagle.music.get(channel.guild.id);
		if (!player || !player.playing) return interaction.reply("There is no music playing right now");

		const Track = player.queue.current!;

		//if its longer than an hour, add the hours onto the start

		const milliseconds = Track.duration || 0;
		const seconds = Math.floor((milliseconds / 1000) % 60);

		const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);

		const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

		const output: string[] = [];

		if (hours >= 1) {
			output.push(hours + "h");
		}
		if (minutes >= 1) {
			output.push(minutes + "m");
		}
		if (seconds >= 1) {
			output.push(seconds + "s");
		}

		let duration = output.join(", ");
		console.log(duration);
		const Embed = new EmbedBuilder();
		Embed.add([
			{ name: "Author: ", value: Track.author!, inline: false },
			{ name: "Length: ", value: duration, inline: false },
		]);

		Embed.setTitle(`Track: ${Track.title}`);
		Embed.setThumbnail(Track.thumbnail!);
		interaction.reply({ embeds: [Embed] });
		return;
	},
};
export default cmd;
