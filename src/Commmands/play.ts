import { SlashCommandBuilder } from "@discordjs/builders";
import { Player } from "erela.js";
import Command from "src/Structures/Command";

const cmd: Command = {
	displayName: "Play",
	build: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play <url>")
		.addStringOption(option => option.setName("url").setDescription("the url to play").setRequired(true)),
	cooldown: 1,
	async execute(interaction, Beagle) {
		let res;
		try {
			// Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
			res = await Beagle.music.search(interaction.options.getString("url")!);
			// Check the load type as this command is not that advanced for basics
			if (res.loadType === "LOAD_FAILED") throw res.exception;
			else if (res.loadType === "PLAYLIST_LOADED") {
				interaction.reply("Playlists are not supported with this command.");
				return;
			}
		} catch (err: any) {
			console.log(err);
			return interaction.reply(`there was an error while searching`);
		}

		if (res.loadType === "NO_MATCHES") return interaction.reply("there was no tracks found with that query.");

		//get the voice channel of the one that sent the command
		//@ts-ignore
		const channel = interaction.member?.voice?.channel;
		console.log(interaction.member);
		if (!channel) {
			interaction.reply("I cant find the voice channel your in.");
			return;
		}

		// if your adding another song to the queue (no need to make a player)
		let player = Beagle.music.get(channel.guild.id);
		//const currentQueueSize = player?.queue.size;
		if (player === undefined) {
			// Create the player
			player = Beagle.music.create({
				guild: channel.guild.id,
				voiceChannel: channel.id,
				textChannel: interaction.channelId,
			}) as Player;
			player!.setVolume(20);

			// Connect to the voice channel and add the track to the queue
			player!.connect();
			player!.queue.add(res.tracks[0]);

			player!.play();
		} else player!.queue.add(res.tracks[0]);
		interaction.reply(`Now playing: ${res.tracks[0].title}, requested by ${interaction.member?.user.username}.`);
		//if (currentQueueSize! >= 1) {}
		return;
	},
};

export default cmd;
