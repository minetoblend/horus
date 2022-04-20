import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { MemberEntity } from "../common/member.entity";
import { GuildEntity } from "../common/guild.entity";
import { CardEntity } from "./card.entity";
import { BotCommand } from "../decorator/bot.command";
import { Injectable } from "@nestjs/common";
import { CardService } from "./card.service";
import { createTemporaryButtonCollector } from "../util/collector";
import { MemberService } from "../common/member.service";

@Injectable()
export class BurnCommand {

  constructor(
    private cardService: CardService,
    private memberService: MemberService
  ) {
  }

  @BotCommand({
    name: "burn",
    abbreviation: "b",
    usage: "burn [card id]",
    description: "burns a card and converts it into gold"
  })
  async burn(message: Message, member: MemberEntity, guild: GuildEntity) {
    let [_, cardId] = message.content.split(" ");
    let card: CardEntity;
    if (cardId) {
      card = await this.cardService.getCardById(cardId);
    } else {
      card = await this.cardService.getLatestCard(member);
    }

    if (!card)
      return message.reply("Unknown card.");

    if (card.owner.id !== member.id)
      return message.reply("You can only burn your own cards.");

    const value = card.cardBurnValue;
    const embed = new MessageEmbed()
      .setTitle("Burn Card")
      .setThumbnail(card.cardType.picture)
      .setColor("RED")
      .setDescription(
        [
          `${message.member.toString()} you will receive:`,
          "",
          `💰 **${value}**  Gold`
        ]
          .join("\n")
      );

    const actionRow = new MessageActionRow();
    actionRow.addComponents(
      new MessageButton()
        .setStyle("SECONDARY")
        .setEmoji("✅")
        .setCustomId("ok"),
      new MessageButton()
        .setStyle("SECONDARY")
        .setEmoji("❌")
        .setCustomId("cancel")
    );

    const reply = await message.reply({
      embeds: [embed],
      components: [actionRow]
    });

    createTemporaryButtonCollector(reply, 30_000, async (interaction) => {
      await interaction.deferUpdate();

      if (card.owner.id !== interaction.user.id)
        return false;


      if (interaction.customId === "ok") {
        const member = await this.memberService.getOrCreateFromMember(interaction.user);
        await this.cardService.burnCard(card);
        member.gold += value;
        await this.memberService.update(member);

        await message.channel.send(`${message.member.toString()}, You have received \`${value}\` gold`);
        return "*Card has been burned*";
      } else if (interaction.customId === "cancel") {

        return "*Burn has been canceled*";
      }

      return false;
    });
  }
}