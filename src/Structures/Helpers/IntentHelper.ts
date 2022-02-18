import { ClientOptions, Intents } from "discord.js";

function IntentHelper(options:Omit<ClientOptions, "intents">):ClientOptions{
    return {...options,intents:[Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES]}
}
export default IntentHelper