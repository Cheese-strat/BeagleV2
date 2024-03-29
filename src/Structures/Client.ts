import { Client, ClientOptions } from "discord.js";
import { Manager } from "erela.js";
import Spotify_Plugin from "erela.js-spotify";
import config from "../../config.json";
import Command from "./Command";
import SlashManager from "./Helpers/SlashManager";
import path from "path";
import { logging } from "./Helpers/Logging";
import SpotifyWebApi from "spotify-web-api-node";

export default class BeagleClient<t extends boolean> extends Client<t> {
	music: Manager;
	GuildCommandList: Map<string, Command>;
	srcPath: string;
	spotify: SpotifyWebApi;
	constructor(opt: ClientOptions, srcPath: string) {
		super(opt);
		console.log(`srcpath=${srcPath}`);
		this.srcPath = srcPath;
		this.GuildCommandList = new Map();
		this.music = new Manager({
			nodes: [config.LavaLink],
			plugins: [
				// Initiate the plugin and pass the two required options.
				new Spotify_Plugin(config.spotifyAccess),
			],
			// Method to send voice data to Discord
			send: (id, payload) => {
				const guild = this.guilds.cache.get(id);
				// NOTE: FOR ERIS YOU NEED JSON.stringify() THE PAYLOAD
				if (guild) guild.shard.send(payload);
			},
		});
		this.spotify = new SpotifyWebApi({
			clientId: config.spotifyAccess.clientID,
			clientSecret: config.spotifyAccess.clientSecret,
			redirectUri: 'http://localhost/'
		});
		this.once("ready", () => {
			this.music.init(this.user!.id);
			logging.info(`Logged in as ${this.user!.tag}`);
		});
		this.music.on("nodeConnect", node => {
			logging.info(`Node "${node.options.identifier}" connected.`);
		});

		this.music.on("nodeError", (node, error) => {
			logging.info(`Node "${node.options.identifier}" encountered an error: ${error.message}.`);
		});
		this.on("interactionCreate", async interaction => {
			if (!interaction.isChatInputCommand()) return;
			if (!interaction.inGuild()) return;

			const command = this.GuildCommandList.get(interaction.commandName);
			if (command) {
				try {
					logging.info(`Running Command ${command.displayName}`);
					await command.execute(interaction, this as BeagleClient<true>).catch(logging.errorUncaught);
					logging.info(`Completed Command: ${command.displayName}`);
				} catch (error) {
					if (error instanceof Error) {
						logging.errorUncaught(error);
					} else {
						logging.error(`There was an error in a command error was of type: ${typeof error}`)
					}
				}
			}
		});
		//this.music.on("trackStart", (player, track) => {
		//const channel = this.channels.cache.get(player.textChannel!) as TextChannel;
		// Send a message when the track starts playing with the track name and the requester's Discord tag, e.g. username#discriminator
		//channel.send(`Now playing: \`${track.title}\`.`);
		//});

		// Emitted the player queue ends
		this.music.on("queueEnd", player => {
			//const channel = client.channels.cache.get(player.TextChannel!) as Textchannel;
			//channel.send("Queue has ended.");
			player.disconnect();
			player.destroy();
		});
	}
	async startup(): Promise<void> {
		logging.info("logging in...");
		// the path given to this is incorrect so that when it is used in /Helpers is correctly paths, needs to check absolute paths in future
		SlashManager(this as BeagleClient<false>, path.join(this.srcPath, "/Commmands"));
		super.login(config.token);
		return;
	}
}
