import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../../config.json";
import BeagleClient from "../Client";
import { readdirSync } from "fs";
import { join, isAbsolute } from "path";
import Command from "../Command";
import { logging } from "./Logging";
const logger = logging.getLogger("Helpers.Slash");

async function SlashManager(client: BeagleClient<false>, cmdFolderPath: string) {
	const rest = new REST({ version: "9" }).setToken(config.token);

	const cmdFolders = readdirSync(cmdFolderPath).filter(file => !file.includes("."));
	for (const folder of cmdFolders) {
		let path = join(cmdFolderPath, folder);
		if (!isAbsolute(path)) logger.error("Invalid path: " + path.toString());
		const commandFiles = readdirSync(path).filter(file => file.endsWith(".js"));

		for (const file of commandFiles) {
			const ImportPath = join(path, file);
			if (!isAbsolute(ImportPath)) throw new Error("Invalid path: " + ImportPath.toString());
			logger.debug(ImportPath);
			const command: Command = (await import(ImportPath)).default;
			command.internalName = command.displayName.toLowerCase() as Lowercase<string>;
			command.category = folder;
			client.GuildCommandList.set(command.internalName, command);
		}
	}

	logger.info("Started refreshing application (/) commands.");
	//logger.info(client.GuildCommandList.get("apex")?.build)
	await rest
		.put(Routes.applicationCommands("631479292252913664"), { body: Array.from(client.GuildCommandList.values()).map(cmd => cmd.build) })
		.then(() => logger.info("Successfully registered application commands."))
		.catch(logger.errorUncaught);

	logger.info("Successfully reloaded application (/) commands.");
}
export default SlashManager;
