import { Client } from "discord.js";
import { GuildService } from "../common/guid.service";

interface CommandOptions<T> {
  handler: keyof T,
  locked?: boolean
}

export type CommandList<T> = Record<string, keyof T | CommandOptions<T>>

export function setupCommands<T>(client: Client, guildService: GuildService, service: T, commands: CommandList<T>) {

  client.on("messageCreate", async message => {
    const guild = await guildService.getOrCreateFromGuild(message.guild);
    if (message.content.startsWith(guild.prefix)) {
      const [commandName, ...params] = message.content.substring(1).split(" ");
      if (commands[commandName]) {
        const command = commands[commandName];
        if (typeof command === "string") {
          (service[command] as unknown as Function)(message, params);
        } else if (typeof command === "object") {
          if (command.locked) {
            if (!guild.botChannel) {
              await message.reply(`No bot channel setup. Use ${guild.prefix}set in the channel you want to use for bot commands.`);
              return;
            } else if (guild.botChannel !== message.channel.id) {
              const channel = await message.guild.channels.fetch(guild.botChannel)
              await message.reply(`This command only works in ` + channel.toString())
              return;
            } else {
              (service[command.handler] as unknown as Function)(message, params)
            }
          }
        }
      }
    }
  });
}