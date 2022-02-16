import { ClientOptions, Intents } from "discord.js";

function IntentHelper(options:Omit<ClientOptions, "intents">):ClientOptions{
    return {...options,intents:[Intents.FLAGS.GUILDS]}
}
export default IntentHelper