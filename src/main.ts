import BeagleClient from "./Structures/Client";
import IntentHelper from "./Structures/Helpers/IntentHelper";
import { clientOptions } from "../config.json";
import path from "path";
import { logging } from "./Structures/Helpers/Logging";

logging.info("creating BeagleClient");
const client = new BeagleClient(IntentHelper(clientOptions), path.resolve(__dirname));

//REQUIRED. Send raw events to Erela.js
client.on("raw", d => client.music.updateVoiceState(d));
["uncaughtException", "warning", "unhandledRejection"].forEach(p => process.on(p, logging.error));
logging.info(`initializing Discord bot`);
client.startup();
process.removeAllListeners("warning");
