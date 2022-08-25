import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../config.json";
import BeagleClient from "../Client";
import { readdirSync } from "fs";
import { join, isAbsolute } from "path";
import Command from "../Command";

async function SlashManager(client: BeagleClient<false>, cmdFolderPath: string) {
	const rest = new REST({ version: "9" }).setToken(config.token);

	const cmdFolders = readdirSync(cmdFolderPath).filter(file => !file.includes("."));
	for (const folder of cmdFolders) {
		let path = join(cmdFolderPath, folder);
		if (!isAbsolute(path)) throw new Error("Invalid path: " + path.toString());
		const commandFiles = readdirSync(path).filter(file => file.endsWith(".js"));

		for (const file of commandFiles) {
			const ImportPath = `${path}\\${file}`
			console.log(ImportPath)
			const command: Command = (await import(ImportPath)).default;
			command.internalName = command.displayName.toLowerCase() as Lowercase<string>;
			command.category = folder;
			client.GuildCommandList.set(command.internalName, command);
		}
	}

	console.log("Started refreshing application (/) commands.");
	//console.log(client.GuildCommandList.get("apex")?.build)
	await rest
		.put(Routes.applicationCommands("631479292252913664"), { body: Array.from(client.GuildCommandList.values()).map(cmd => cmd.build) })
		.then(() => console.log("Successfully registered application commands."))
		.catch(console.error);

	console.log("Successfully reloaded application (/) commands.");
}
export default SlashManager;
