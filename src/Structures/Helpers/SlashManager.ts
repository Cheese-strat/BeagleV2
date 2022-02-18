import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../config.json";
import BeagleClient from "../Client";
import {readdirSync}from"fs"
import { isAbsolute } from "path";
import Command from "../Command";

async function SlashManager(client: BeagleClient<false>, cmdFolderPath: string) {
	if (!isAbsolute(cmdFolderPath)) throw new Error("Invalid path: "+cmdFolderPath.toString())
	const rest = new REST({ version: "9" }).setToken(config.token);

	const commandFiles = readdirSync(cmdFolderPath).filter(file => file.endsWith('.js'));
	
	
	for (const file of commandFiles) {
		const command:Command = (await import(`${cmdFolderPath}/${file}`)).default;
		command.internalName = command.displayName.toLowerCase()
		
		client.GuildCommandList.set(command.internalName,command);
	}
	
	console.log("Started refreshing application (/) commands.");


	await rest.put(Routes.applicationGuildCommands("631479292252913664", "744527014039519263"), { body: Array.from(client.GuildCommandList.values()).map(cmd=>cmd.build) })
		.then(() => console.log("Successfully registered application commands."))
		.catch(console.error);

	console.log("Successfully reloaded application (/) commands.");
}
export default SlashManager;
