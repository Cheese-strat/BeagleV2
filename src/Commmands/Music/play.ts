import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { Player } from "erela.js";
import Command from "src/Structures/Command";
import { logging } from "../../Structures/Helpers/Logging";
import { exec } from "child_process";

const cmd: Command = {
	displayName: "Play",
	build: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play <url>")
		.addStringOption(option => option.setName("url").setDescription("the url to play").setRequired(true)),
	cooldown: 1,
	async execute(interaction: ChatInputCommandInteraction, Beagle) {

		let res;
		let param = interaction.options.getString("url") || ""
		try {

			logging.info(param);
			// Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
			res = await Beagle.music.search(param);

			// Check the load type as this command is not that advanced for basics
			if (res.loadType === "LOAD_FAILED") throw res.exception;
			else if (res.loadType === "PLAYLIST_LOADED") {
				interaction.reply("Playlists are not supported with this command.");
				return;
			}
		} catch (err: any) {
			logging.info(err);
			interaction.reply(`there was an error while searching`);
			return;
		}

		if (res.loadType === "NO_MATCHES") {
			interaction.reply("there was no tracks found with that query.");
			return;
		}

		//get the voice channel of the one that sent the command
		//@ts-ignore
		const channel = interaction.member?.voice?.channel;
		if (!channel) {
			interaction.reply("I cant find the voice channel your in.");
			return;
		}

		// if your adding another song to the queue (no need to make a player)
		let player = Beagle.music.get(channel.guild.id);
		const track = res.tracks[0]
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
			player!.queue.add(track);

			player!.play();
		} else player!.queue.add(track);
		interaction.reply(`Added to queue: ${track.title}, requested by ${interaction.member?.user.username}.`);
		//if (currentQueueSize! >= 1) {}
		// Search tracks whose artist's name contains 'Kendrick Lamar', and track name contains 'Alright'
		//Beagle.spotify.searchTracks(`track:${track.title} artist:${track.author}`)
		//	.then(function (data) {
		//let uri = data.body.tracks?.items[0].uri
		//logging.info(`spotify api query result is URI ${uri || "not defined"}`);
		if (process.platform === "linux") {
			try {
				//exec(`bash savify.sh ${param}`) //uri

				exec(`bash /home/beanman/SpotLoader/savify.sh ${param}`, (error, stdout, stderr) => {
					if (error) {
						logging.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				});

			} catch (error) {
				logging.error(`${error}`)
			}
		}
		//}, function (err) {
		//	logging.error(err);
		//});
		//return;
	},
};

export default cmd;
