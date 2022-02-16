import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ClientOptions } from "discord.js";
//import SlashManager from "../Structures/Helpers/SlashManager"
import { Manager } from "erela.js";
import config from "../../config.json";
import SlashManager from "./Helpers/SlashManager";
export default class BeagleClient extends Client {
	music: Manager;
    GuildCommandList:any[];
	constructor(opt: ClientOptions) {
		super(opt);
        this.GuildCommandList=[];
		this.music = new Manager({
			nodes: [config.LavaLink],
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
        this.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            const { commandName } = interaction;
        
            if (commandName === 'ping') {
                await interaction.reply('Pong!');
            } else if (commandName === 'beep') {
                await interaction.reply('Boop!');
            }
            
        });
	}
    async startup():Promise<void>{
        console.log ("logging in...")
        const commands = [
            new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
            new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
            new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
        ]
        SlashManager(this,commands)
        super.login(config.token)
        return
    }
}
