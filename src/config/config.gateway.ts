import { Injectable } from "@nestjs/common";
import { InjectDiscordClient, On } from "@discord-nestjs/core";
import { Client, GuildChannel, Message } from "discord.js";
import { GuildService } from "../common/guid.service";
import { setupCommands } from "../util/command";

@Injectable()
export class ConfigGateway {

  constructor(
    @InjectDiscordClient()
    private client: Client,
    private guildService: GuildService
  ) {
    setupCommands(client, guildService, this, {
      set: "setBotChannel"
    });
  }

  @On("messageCreate")
  onMessage(message: Message) {
    if (message.content.startsWith("$$setprefix") && message.member.permissionsIn(message.channelId).has("ADMINISTRATOR"))
      this.setPrefix(message);
  }

  async setPrefix(message: Message) {
    const parts = message.content.split(" ");
    if (parts.length === 1) {
      const guild = await this.guildService.getOrCreateFromGuild(message.guild);
      return message.reply("Current prefix: " + guild.prefix);
    }
    if (parts.length !== 2) {
      return message.reply("Usage: prefix <prefix>");
    }
    const [_, prefix] = parts;
    if (prefix.length > 1) {
      return message.reply("Prefix must be exactly one character");
    }
    const guild = await this.guildService.getOrCreateFromGuild(message.guild);
    guild.prefix = prefix;
    await this.guildService.update(guild);
    await message.reply(`Successfully changed prefix to ${prefix}`);
  }

  async setBotChannel(message: Message) {
    if (!message.member.permissionsIn(message.channelId).has("ADMINISTRATOR"))
      return;
    const guild = await this.guildService.getOrCreateFromGuild(message.guild);
    guild.botChannel = message.channel.id;
    await this.guildService.update(guild);
    await message.reply("Successfully set up the bot channel");
  }



}
