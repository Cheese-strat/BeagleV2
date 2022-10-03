import { EventEmitter } from "events";
import { createWriteStream } from "fs";
const output = createWriteStream("./stdout.log");
const errorOutput = createWriteStream("./stderr.log");
// Custom simple logger

export class LogManager extends EventEmitter {
	// Prevent the console logger from being added twice
	private consoleLoggerRegistered: boolean = false;

	private loggerRedirect: Console = new console.Console({ stdout: output, stderr: errorOutput });
	public getLogger(module: string): Logger {
		return new Logger(this, module);
	}

	public registerConsoleLogger(): LogManager {
		if (this.consoleLoggerRegistered) return this;
		this.on("log", (logEntry: LogEntry | ErrorLogEntry) => {
			if ("message" in logEntry) {
				//logging
				const msg = `${logEntry.location} [${logEntry.module}] ${logEntry.message}`;
				switch (logEntry.level) {
					case "trace":
						this.loggerRedirect.trace(msg);
						console.trace(msg);
						break;
					case "debug":
						this.loggerRedirect.debug(`Debug: ${msg}`);
						console.debug(`Debug: ${msg}`);
						break;
					case "info":
						this.loggerRedirect.info(`Info: ${msg}`);
						console.info(`Info: ${msg}`);
						break;
					case "warn":
						this.loggerRedirect.warn(`Warning: ${msg}`);
						console.warn(`Warning: ${msg}`);
						break;
					case "error":
						this.loggerRedirect.error(msg);
						console.error(msg);
						break;
					default:
						///@ts-ignore
						this.loggerRedirect.log(`{${logEntry.level}} ${msg}`);
						console.log();
				}
			} else {
				let location = logEntry.error.stack ? logEntry.error.stack.split("\n")[1].slice(7) : "Unknown";
				const msg = `${location} [${logEntry.module}] ${logEntry.error.message}`;
				switch (logEntry.level) {
					case "warn":
						this.loggerRedirect.log(`Warning: ${msg}`);
						break;
					case "error":
						this.loggerRedirect.log(`Error: ${msg}`);
						break;
					default:
						///@ts-ignore
						this.loggerRedirect.log(`{${logEntry.level}} ${msg}`);
				}
				this.loggerRedirect.error(logEntry.error);
			}
		});

		this.consoleLoggerRegistered = true;
		return this;
	}
}

export interface LogEntry {
	level: "info" | "trace" | "debug" | "warn" | "error";
	module: string;
	location?: string;
	message: string;
}
export interface ErrorLogEntry {
	level: "warn" | "error";
	module: string;
	error: Error;
}
export const logging = new LogManager();

export class Logger {
	private logManager: EventEmitter;
	private module: string;

	constructor(logManager: EventEmitter, module: string) {
		this.logManager = logManager;
		this.module = module;
	}

	public log(logLevel: LogEntry["level"], message: string): void {
		const logEntry: LogEntry = { level: logLevel, module: this.module, message };

		// Obtain the line/file through a thoroughly hacky method
		// This creates a new stack trace and pulls the caller from it.  If the caller
		// if .trace()
		const error = new Error("");
		if (error.stack) {
			const cla = error.stack.split("\n");
			let idx = 1;
			while (idx < cla.length && cla[idx].includes("at Logger.Object.")) idx++;
			if (idx < cla.length) {
				logEntry.location = cla[idx].slice(cla[idx].indexOf("at ") + 3, cla[idx].length);
			}
		}

		this.logManager.emit("log", logEntry);
	}

	public logError(logLevel: "warn" | "error", error: Error): void {
		const ErrorlogEntry: ErrorLogEntry = { level: logLevel, module: this.module, error };
		this.logManager.emit("log", ErrorlogEntry);
		return;
	}

	public trace(message: string): void {
		this.log("trace", message);
	}
	public debug(message: string): void {
		this.log("debug", message);
	}
	public info(message: string): void {
		this.log("info", message);
	}
	public warn(message: string): void {
		this.log("warn", message);
	}
	public WarnUncaught(error: Error): void {
		this.logError("warn", error);
	}
	public error(message: string): void {
		this.log("error", message);
	}
	public errorUncaught(error: Error): void {
		this.logError("error", error);
	}
}
