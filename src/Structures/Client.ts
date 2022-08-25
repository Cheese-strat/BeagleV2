import { Client, ClientOptions } from "discord.js";
import { Manager } from "erela.js";
import Spotify from "erela.js-spotify";
import config from "../../config.json";
import Command from "./Command";
import SlashManager from "./Helpers/SlashManager";
import path from "path"

export default class BeagleClient<t extends boolean> extends Client<t> {
	music: Manager;
	GuildCommandList: Map<string, Command>;
	srcPath:string
	constructor(opt: ClientOptions, srcPath:string) {
		super(opt);
		console.log(`srcpath=${srcPath}`);
		this.srcPath = srcPath;
		this.GuildCommandList = new Map();
		this.music = new Manager({
			nodes: [config.LavaLink],
			plugins: [
				// Initiate the plugin and pass the two required options.
				new Spotify(config.spotifyAccess),
			],
			// Method to send voice data to Discord
			send: (id, payload) => {
				const guild = this.guilds.cache.get(id);
				// NOTE: FOR ERIS YOU NEED JSON.stringify() THE PAYLOAD
				if (guild) guild.shard.send(payload);
			},
		});
		this.once("ready", () => {
			this.music.init(this.user!.id);
			console.log(`Logged in as ${this.user!.tag}`);
		});
		this.music.on("nodeConnect", node => {
			console.log(`Node "${node.options.identifier}" connected.`);
		});

		this.music.on("nodeError", (node, error) => {
			console.log(`Node "${node.options.identifier}" encountered an error: ${error.message}.`);
		});
		this.on("interactionCreate", async interaction => {
			if (!interaction.isChatInputCommand()) return;

			const command = this.GuildCommandList.get(interaction.commandName);
			if (command) {
				await command.execute(interaction, this as BeagleClient<true>);
				console.log(`completed command: ${command.displayName}`);
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
		console.log("logging in...");
		// the path given to this is incorrect so that when it is used in /Helpers is correctly paths, needs to check absolute paths in future
		SlashManager(this as BeagleClient<false>, path.join(this.srcPath ,"/Commmands"));
		super.login(config.token);
		return;
	}
}
