import {
  DiscordGuard,
  EventType
} from "@discord-nestjs/core";
import { Message } from "discord.js";
import { GuildService } from "../common/guid.service";
import { Inject } from "@nestjs/common";


export class BotChannelGuard implements DiscordGuard {

  constructor(
    @Inject(GuildService) private guildService: GuildService
  ) {
  }

  async canActive(event: EventType, [message]: [Message]): Promise<boolean> {
    if (event === "messageCreate") {
      const guild = await this.guildService.getFromGuild(message.guild);
      return guild?.botChannel === message.channelId;
    }
    return false;
  }


}