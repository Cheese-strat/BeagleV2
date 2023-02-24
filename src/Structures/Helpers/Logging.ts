//import { createWriteStream } from "fs";
//const launchstamp = Date.now()
//const output = createWriteStream(`./Logs/${launchstamp}_out.log`);
//const errorOutput = createWriteStream(`./Logs/${launchstamp}_err.log`);
// Custom simple logger

export class Logger {
	private registered: boolean = false;

	//private FileLogger: Console = new console.Console({ stdout: output, stderr: errorOutput });
	constructor() {
		if (this.registered) return this;
		// Bind the logging functions
		this.debug = this.debug.bind(this);
		this.info = this.info.bind(this);
		this.warn = this.warn.bind(this);
		this.error = this.error.bind(this);
		this.errorUncaught = this.errorUncaught.bind(this);
		this.registered = true;
		return this;
	}
	private GetLocation(): string | undefined {
		// Obtain the line/file through a thoroughly hacky method
		// This creates a new stack trace and pulls the caller from it.  If the caller
		// if .trace()
		const error = new Error("");
		if (error.stack) {
			const cla = error.stack.split("\n");
			let idx = 1;
			while (idx < cla.length && cla[idx].includes("at Logger.")) idx++;
			if (idx < cla.length) {
				return cla[idx].slice(cla[idx].indexOf("at ") + 3, cla[idx].length);
			}
		}
		return undefined;
	}

	public debug(message: string): void {
		const locale = this.GetLocation() || "Unknown";
		//this.FileLogger.debug(`Debug: ${locale} ${message}`);
		console.debug(`Debug: ${locale} ${message}`);
	}
	public info(message: string): void {
		const locale = this.GetLocation() || "Unknown";
		//this.FileLogger.info(`Info: ${locale} ${message}`);
		console.info(`Info: ${locale} ${message}`);
	}
	public warn(message: string): void {
		const locale = this.GetLocation() || "Unknown";
		//this.FileLogger.warn(`Warning: ${locale} ${message}`);
		console.warn(`Warning: ${locale} ${message}`);
	}
	public error(message: string): void {
		const locale = this.GetLocation() || "Unknown";
		//this.FileLogger.error(`${locale} ${message}`);
		console.error(`${locale} ${message}`);
	}
	public errorUncaught(error: Error): void {
		const locale = this.GetLocation() || "Unknown";
		//if (locale === "Unknown") this.FileLogger.warn("Location was not Found");
		//this.FileLogger.log(`Error: ${locale} ${error.message}`);

		console.log(`Error: ${locale} ${error.message}`);
		//this.FileLogger.error(error);
		console.error(error);
	}
}
export const logging = new Logger();
