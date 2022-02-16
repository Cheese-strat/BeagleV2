import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../config.json";
import BeagleClient from "../Client";
import {readdirSync}from"fs"
import { isAbsolute } from "path";

async function SlashManager(client: BeagleClient, cmdFolderPath: string) {
	if (!isAbsolute(cmdFolderPath)) throw new Error("Invalid path: "+cmdFolderPath.toString())
	const rest = new REST({ version: "9" }).setToken(config.token);

	client.GuildCommandList;
	const commandFiles = readdirSync(cmdFolderPath).filter(file => file.endsWith('.js'));
	
	
	for (const file of commandFiles) {
		const command = require(`${cmdFolderPath}/${file}`);
		client.GuildCommandList.push(command.data.toJSON());
	}
	
	console.log("Started refreshing application (/) commands.");

	const sendables = client.GuildCommandList.map(command => command.toJSON());

	await rest.put(Routes.applicationGuildCommands("631479292252913664", "491564959835226112"), { body: sendables })
		.then(() => console.log("Successfully registered application commands."))
		.catch(console.error);

	console.log("Successfully reloaded application (/) commands.");
}
export default SlashManager;
