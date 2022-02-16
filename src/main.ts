import BeagleClient from "./Structures/Client";
import IntentHelper from "./Structures/Helpers/IntentHelper"
import { client_Options } from "../config.json";


const client = new BeagleClient(IntentHelper(client_Options));

console.log(`initializing Discord bot`);

// THIS IS REQUIRED. Send raw events to Erela.js
client.on("raw", d => client.music.updateVoiceState(d));

client.startup();
["uncaughtException", "warning", "unhandledRejection"].forEach(p => process.on(p, console.error));

