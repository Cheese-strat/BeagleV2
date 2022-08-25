///@ts-nocheck
import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../../Structures/Command";

import {ChatInputCommandInteraction, EmbedBuilder}  from "discord.js";

const cmd: Command = {
	displayName: "Queue",
	build: new SlashCommandBuilder().setName("queue").setDescription("lists the queue of music to play"),
	cooldown: 2,

	async execute(interaction:ChatInputCommandInteraction, Beagle) {
		const player = Beagle.music.get(interaction.guildId || "");
		if (!player) {
			interaction.reply("There is nothing playing in this server.");
			return;
		}
/*
		const queue = player.queue;
		
		const embed = new EmbedBuilder()

		// change for the amount of tracks per page
		const multiple = 10;
		const page = msg.args.length && Number(msg.args[0]) ? Number(msg.args[0]) : 1;

		const end = page * multiple;
		const start = end - multiple;

		const tracks = queue.slice(start, end);
        embed.setAuthor({name:`Queue for ${interaction.guild?.name}`});
		if (queue.current)
			embed.embed.fields?.push({
				name: "Current",
				value: `[${queue.current.title}](${queue.current.uri})`,
			});

		if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
		else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

		const maxPages = Math.ceil(queue.length / multiple);

		embed.setFooter(`Page ${page > maxPages ? maxPages : page} of ${maxPages}`);
*/
		interaction.reply("embed");
		return;
	},
};
export default cmd;