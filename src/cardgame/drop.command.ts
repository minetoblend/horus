import { Inject, Injectable, Scope } from "@nestjs/common";
import {
  ArgNum,
  InteractionEventCollector,
  On,
  Payload,
  PrefixCommand, UseCollectors,
  UseGuards,
  UsePipes
} from "@discord-nestjs/core";
import { CardService } from "./card.service";
import { MemberService } from "../common/member.service";
import {
  Interaction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from "discord.js";
import { CardRenderer } from "./card.renderer";
import { BotCommand } from "../decorator/bot.command";
import { MemberEntity } from "../common/member.entity";
import { createTemporaryButtonCollector } from "../util/collector";
import { CardEntity, CardQuality } from "./card.entity";


@Injectable()
export class DropCommand {

  constructor(
    private cardService: CardService,
    private memberService: MemberService,
    private cardRenderer: CardRenderer
  ) {
  }

  @BotCommand({
    name: "drop",
    abbreviation: "d",
    restricted: true,
    description: `Drops a random card. Can be used every 30 minutes.`
  })
  async drop(message: Message, member: MemberEntity) {

    this.memberService.locked(async () => {
      member.lastDropAt = new Date();
      await this.memberService.update(member);

      const [_, name] = message.content.trim().split(' ');

      const card = await this.cardService.createDrop(member, name);

      const embed = new MessageEmbed()
        .setImage("attachment://card.png")
        .setTitle(card.cardType.name)
        .setURL(`https://osu.ppy.sh/users/${card.cardType.profileId}`);

      const actionRow = new MessageActionRow();
      actionRow.addComponents(new MessageButton()
        .setStyle("PRIMARY")
        .setLabel("Grab")
        .setCustomId("grab")
      );

      const files = [
        {
          attachment: await this.cardRenderer.renderCard(card),
          name: "card.png"
        }
      ];

      const reply = await message.reply({ embeds: [embed], components: [actionRow], files });
      createTemporaryButtonCollector(reply, 30_000, (interaction, dispose) => this.grabCard(card, interaction, reply, dispose));
    });
  }

  async grabCard(card: CardEntity, interaction: MessageComponentInteraction, message: Message, dispose: Function) {
    if(interaction.customId !== 'grab')
      return false;
    if (interaction.user.id === card.droppedBy.id) {
      if (card.owner) {
        if (card.owner.id !== interaction.user.id) {
          await interaction.reply("You fought  over the card and came out victorious.");
        } else {
          await interaction.reply("Card cannot be grabbed");
          return false;
        }
      } else {
        const member = await this.memberService.getOrCreateFromMember(interaction.user);
        await this.cardService.claim(member, card);
        await this.printGrabMessage(card, interaction);
      }
    } else {
      if (card.owner)
        await interaction.reply("Card cannot be grabbed");
      else {
        const member = await this.memberService.getOrCreateFromMember(interaction.user);
        await this.cardService.claim(member, card);
        await this.printGrabMessage(card, interaction);
        return false;
      }
    }

    //await message.reply("grab");
    dispose();
    return "*This card can no longer be grabbed.*";
  }

  async printGrabMessage(card: CardEntity, interaction: MessageComponentInteraction) {
    let condition;
    switch (card.quality) {
      case CardQuality.DAMAGED:
        condition = "Unfortunately, it is badly damaged.";
        break;
      case CardQuality.POOR:
        condition = "It's condition is quite poor.";
        break;
      case CardQuality.GOOD:
        condition = "It's in good condition.";
        break;
      case CardQuality.GREAT:
        condition = "It is great condition.";
        break;
      case CardQuality.MINT:
        condition = "It is in mint condition.";
        break;
    }

    await interaction.reply(`${interaction.user.toString()} took the ${card.cardType.name} card \`${card.id}\`. ${condition}`);
  }
}

