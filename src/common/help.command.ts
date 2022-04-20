import { Inject, Injectable } from "@nestjs/common";
import { CommandGateway } from "./command.gateway";
import { BotCommand } from "../decorator/bot.command";
import { Message, MessageEmbed } from "discord.js";
import { MemberEntity } from "./member.entity";
import { GuildEntity } from "./guild.entity";

@Injectable()
export class HelpCommand {

  constructor(
    private readonly commandGateway: CommandGateway
  ) {
  }

  @BotCommand({
    name: "help",
    abbreviation: "h"
  })
  help(message: Message, member: MemberEntity, guild: GuildEntity) {

    const [_, commandName] = message.content.trim().split(" ");
    const prefix = guild.prefix || "$";
    if (commandName) {
      const command = this.commandGateway.commands.find(it => it.options.name === commandName || it.options.abbreviation === commandName);
      if (!command) {
        message.reply(`Unknown command \`${commandName}\``);
      } else {
        const embed = new MessageEmbed()
          .setTitle(`${command.options.name} command`);
        let descriptionParts = [];

        if (command.options.usage) {
          descriptionParts.push(`usage: \`${prefix}${command.options.usage}\``);
        } else {
          descriptionParts.push(`usage: \`${prefix}${command.options.name}\``);
        }

        if (command.options.abbreviation)
          descriptionParts.push(`alias: \`${prefix}${command.options.abbreviation}\``);

        if (command.options.description) {
          if (descriptionParts.length)
            descriptionParts.push("");
          descriptionParts.push(command.options.description);
        }

        embed.setDescription(descriptionParts.join("\n"));
        message.reply({ embeds: [embed] });
      }

    } else {
      message.reply([
        `Usage: \`${prefix}help <command>\``,
        "Available commands: " + this.commandGateway.commands.map(command => `\`${command.options.name}\``).join(" ")
      ].join("\n"));
    }
  }

}