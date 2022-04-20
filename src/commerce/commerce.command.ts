import { Injectable } from "@nestjs/common";
import { BotCommand } from "../decorator/bot.command";
import { Message } from "discord.js";
import { MemberEntity } from "../common/member.entity";
import { MemberService } from "../common/member.service";

@Injectable()
export class CommerceCommands {

  constructor(
    private memberService: MemberService
  ) {

  }


  @BotCommand({
    name: "gamble"
  })
  async gamble(message: Message, member: MemberEntity) {
    const [_, amount] = message.content.split(" ");
    const gold = parseInt(amount);
    if (!isNaN(gold) && gold >= 0) {
      if (gold > member.gold) {
        await message.reply("Can't gamble more than you have.");
        return;
      }
      if (Math.random() < 0.5) { //won
        member.gold += gold;
        await this.memberService.update(member);
        await message.reply(`Congrats! You won \`${gold}\` gold.`);
      } else {
        member.gold -= gold;
        await this.memberService.update(member);
        await message.reply(`What a shame! You lost \`${gold}\` gold.`);
      }

    } else {
      await message.reply("Invalid amount");
    }
  }


}