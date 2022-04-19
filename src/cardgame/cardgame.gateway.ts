import { Injectable } from "@nestjs/common";
import { setupCommands } from "../util/command";
import { Client, Message, MessageEmbed } from "discord.js";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { GuildService } from "../common/guid.service";
import { MemberService } from "../common/member.service";
import { intervalToDuration, addDays } from "date-fns";

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
      },
      daily: {
        locked: true,
        handler: "daily"
      },
      give: "give"
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

      await message.reply("Invalid amount");
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
      await message.reply("Invalid amount");
    }
  }

  async daily(message: Message) {
    const member = await this.memberService.getOrCreateFromMember(message.member);

    if (member.collectedDailyAt) {
      const duration = intervalToDuration({ start: member.collectedDailyAt, end: new Date() });
      console.log(duration);
      if (duration.hours < 24) {
        const nextDay = addDays(member.collectedDailyAt, 1);
        const durationUntil = intervalToDuration({ start: new Date(), end: nextDay });
        let text;
        if (durationUntil.hours)
          text = `${Math.round(durationUntil.hours + durationUntil.minutes / 60)} hours`;
        else if (durationUntil.minutes)
          text = `${durationUntil.minutes} minutes`;
        else
          text = `${durationUntil.hours} seconds`;
        return message.reply(`You have already redeemed your daily reward. Try again in ${text}.`);
      }
    }

    const amount = Math.floor(Math.random() * 50 + 50);
    member.gold += amount;
    member.collectedDailyAt = new Date();
    await this.memberService.update(member);
    await message.reply(`You have gained ${amount} gold.`);
  }

  async give(message: Message, [member, amount, item]: string[]) {
    if (!member || !amount || !item) {
      return message.reply("no");
    }
    const giver = await this.memberService.getOrCreateFromMember(message.member);

    const amountParsed = parseInt(amount);
    if (isNaN(amountParsed) || amountParsed < 0) {
      return message.reply("Invalid amount");
    }

    this.memberService.locked(async () => {

      const receiver = await this.memberService.findByIdOrCreate(member.slice(2, -1));
      if (receiver.id === message.member.id) {
        return message.reply("Can't give stuff to yourself.");
      }

      switch (item) {
        case "gold":
          if (amountParsed > giver.gold)
            return message.reply("Can't give more than you have.");
          receiver.gold += amountParsed;
          giver.gold -= amountParsed;
          await this.memberService.update(giver, receiver);
          return message.reply(`Succesfully gave ${amountParsed} gold to ${
            (await message.guild.members.fetch(receiver.id)).toString()
          }`)

        default:
          message.reply("Unknown item " + item);
      }

    });
  }


}