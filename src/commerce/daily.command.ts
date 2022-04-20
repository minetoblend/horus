import { Message } from "discord.js";
import { MemberEntity } from "../common/member.entity";
import { GuildEntity } from "../common/guild.entity";
import { BotCommand } from "../decorator/bot.command";
import { Injectable } from "@nestjs/common";
import { MemberService } from "../common/member.service";
import { addDays, intervalToDuration } from "date-fns";

@Injectable()
export class DailyCommand {

  constructor(
    private memberService: MemberService
  ) {
  }

  @BotCommand({
    name: "daily",
    description: "Gives you a daily amount of cash"
  })
  async burn(message: Message, member: MemberEntity, guild: GuildEntity) {

    if (member.collectedDailyAt) {
      const duration = intervalToDuration({ start: member.collectedDailyAt, end: new Date() });
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
    await message.channel.send(`${message.member}, You have gained ${amount} gold.`);
  }
}