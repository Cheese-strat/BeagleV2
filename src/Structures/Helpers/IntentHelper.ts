import { ClientOptions, GatewayIntentBits  } from "discord.js";

function IntentHelper(options:Omit<ClientOptions, "intents">):ClientOptions{
    return {...options,intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates]}
}
export default IntentHelper