import BeagleClient from "./Structures/Client";
import IntentHelper from "./Structures/Helpers/IntentHelper";
import { clientOptions } from "../config.json";
import path from "path";
import { logging } from "./Structures/Helpers/Logging";
logging.registerConsoleLogger();
const logger = logging.getLogger("Core");
logger.info("creating BeagleClient");
const client = new BeagleClient(IntentHelper(clientOptions), path.resolve(__dirname));

//REQUIRED. Send raw events to Erela.js
client.on("raw", d => client.music.updateVoiceState(d));
["uncaughtException", "warning", "unhandledRejection"].forEach(p => process.on(p, logger.error));
logger.info(`initializing Discord bot`);
client.startup();
process.removeAllListeners('warning');
