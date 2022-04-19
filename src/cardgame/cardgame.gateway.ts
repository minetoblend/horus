import { Injectable } from "@nestjs/common";
import { setupCommands } from "../util/command";
import { Client, Message, MessageEmbed } from "discord.js";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { GuildService } from "../common/guid.service";
import { MemberService } from "../common/member.service";

@Injectable()
export class CardgameGateway {

  constructor(
    @InjectDiscordClient()
    private client: Client,
    private guildService: GuildService,
    private memberService: MemberService
  ) {
    setupCommands(client, guildService, this, {
      inventory: {
        locked: true,
        handler: "showInventory"
      },
      setgold: {
        locked: true,
        handler: "setGold"
      },
      gamble: {
        locked: true,
        handler: "gamble"
      }
    });
  }

  async showInventory(message: Message) {
    const member = await this.memberService.getOrCreateFromMember(message.member);

    const embed = new MessageEmbed();
    embed.setDescription(`Items carried by ${message.member.toString()}`);
    embed.addFields(
      { name: "Gold", value: member.gold.toString(), inline: true }
    );

    await message.reply({
      embeds: [embed]
    });
  }

  async setGold(message: Message, [amount]: string[]) {
    const gold = parseInt(amount);
    const member = await this.memberService.getOrCreateFromMember(message.member);
    if (!isNaN(gold) && gold >= 0) {
      member.gold = gold;
      await this.memberService.update(member);
      await message.reply("Updated your amount of gold");
    } else {

      await message.reply("Unknown amount");
    }
  }

  async gamble(message: Message, [amount]: string[]) {
    const gold = parseInt(amount);
    const member = await this.memberService.getOrCreateFromMember(message.member);
    if (!isNaN(gold) && gold >= 0) {
      if (gold > member.gold) {
        await message.reply("Can't gamble more than you have.");
        return;
      }
      if (Math.random() < 0.5) { //won
        member.gold += gold;
        await this.memberService.update(member);
        await message.reply(`Congrats! You won ${gold} gold.`);
      } else {
        member.gold -= gold;
        await this.memberService.update(member);
        await message.reply(`What a shame! You lost ${gold} gold.`);
      }

    } else {
      await message.reply("Unknown amount");
    }
  }

}