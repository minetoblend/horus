import { Injectable } from "@nestjs/common";
import { setupCommands } from "../util/command";
import { ButtonInteraction, Client, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { InjectDiscordClient, On } from "@discord-nestjs/core";
import { GuildService } from "../common/guid.service";
import { MemberService } from "../common/member.service";
import { addDays, intervalToDuration } from "date-fns";
import { CardService } from "./card.service";
import { CardEntity, CardQuality } from "./card.entity";
import { createPagination } from "../util/pagination";
import { MemberEntity } from "../common/member.entity";
import { CardRenderer } from "./card.renderer";

@Injectable()
export class CardgameGateway {

  constructor(
    @InjectDiscordClient()
    private client: Client,
    private guildService: GuildService,
    private memberService: MemberService,
    private cardService: CardService,
    private cardRenderer: CardRenderer
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
      give: "give",
      drop: {
        locked: true,
        handler: "drop"
      },
      resetDrop: {
        locked: true,
        handler: "resetDrop"
      },
      view: {
        locked: true,
        handler: "view"
      },
      collection: {
        locked: true,
        handler: "collection"
      },
      burn: {
        locked: true,
        handler: "burn"
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
          }`);

        default:
          message.reply("Unknown item " + item);
      }

    });
  }


  async drop(message: Message, [name]: string[]) {

    const member = await this.memberService.getOrCreateFromMember(message.member);

    if (member.lastDropAt && false) {
      const duration = Math.floor((new Date().getTime() - member.lastDropAt.getTime()) / 1000);


      if (duration < 30 * 60) {

        const durationUntil = Math.floor((30 * 60 - duration));
        let text;
        if (durationUntil > 60)
          text = `${Math.round(durationUntil / 60)} more minutes`;
        else
          text = `${durationUntil} more seconds`;
        return message.reply(`You must wait \`${text}\` before dropping more cards.`);
      }

    }

    member.lastDropAt = new Date();
    this.memberService.update(member);

    const drop = await this.cardService.createDrop(member, name);


    const embed = new MessageEmbed()
      .setImage("attachment://card.png")
      .setTitle(drop.cardType.name)
      .setURL(`https://osu.ppy.sh/users/${drop.cardType.profileId}`);

    const actionRow = new MessageActionRow();
    actionRow.addComponents(new MessageButton()
      .setStyle("PRIMARY")
      .setLabel("Grab")
      .setCustomId("grab_card:" + drop.id)
    );

    const files = [
      {
        attachment: await this.cardRenderer.renderCard(drop),
        name: "card.png"
      }
    ];

    const reply = await message.reply({ embeds: [embed], components: [actionRow], files });

    setTimeout(async () => {
      const card = await this.cardService.getCardById(drop.id);
      if (card.claimedAt)
        await reply.edit({
          components: [],
          embeds: [embed],
          files
        });
      else
        await reply.edit({
          content: "*This card can no longer be grabbed.*",
          components: [],
          embeds: [embed]
        });
    }, 30_000);
  }

  async resetDrop(message: Message) {
    const member = await this.memberService.getOrCreateFromMember(message.member);
    member.lastDropAt = null;
    await this.memberService.update(member);
    await message.reply("done");
  }

  @On("interactionCreate")
  async onMessage(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith("grab_card")) {
      const member = await this.memberService.getOrCreateFromMember(interaction.user);
      const [_, id] = interaction.customId.split(":");
      const drop = await this.cardService.getCardById(id);

      if (drop) {

        if (drop.owner) {
          if (drop.droppedBy.id === interaction.user.id && drop.owner.id !== interaction.user.id) {
            await this.cardService.claim(member, drop);
            return interaction.reply("You fought  over the card and came out victoriously.");
          } else {
            return interaction.reply("Card was already claimed.");
          }
        } else {
          await this.cardService.claim(member, drop);
          let condition;
          switch (drop.quality) {
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

          await interaction.reply(`${interaction.user.toString()} took the ${drop.cardType.name} card \`${drop.id}\`. ${condition}`);
        }
      }
    }
  }

  async view(message: Message, [id]: string[]) {
    let card: CardEntity | undefined;
    const member = await this.memberService.getOrCreateFromMember(message.member);
    if (id) {
      card = await this.cardService.getCardById(id);
    } else {
      card = await this.cardService.getLatestCard(member);
    }

    if (!card) {
      message.reply("Could not find card");
    } else {
      const image = await this.cardRenderer.renderCard(card);


      const embed = new MessageEmbed()
        .setTitle(card.cardType.name)
        .setFields({
          name: "quality", value: CardQuality[card.quality].toLowerCase()!
        })
        .setImage("attachment://card.png")
        .setURL(`https://osu.ppy.sh/users/${card.cardType.profileId}`);

      message.reply({
        embeds: [embed],
        files: [
          {
            attachment: image,
            name: "card.png"
          }
        ]
      });
    }
  }

  async collection(message: Message) {
    let member: MemberEntity;
    if (message.mentions.users.size > 0) {
      member = await this.memberService.getOrCreateFromMember(message.mentions.users.first());
    } else {
      member = await this.memberService.getOrCreateFromMember(message.member);
    }

    await createPagination(message, async (offset, limit) => {
      const numCards = await this.cardService.getCardCountByMember(member);
      const cards = await this.cardService.getCardsByMemberPaginated(member, offset, limit);
      const embed = new MessageEmbed()
        .setDescription(`Cards owned by <@${member.id}>.`)
        .addFields(
          ...cards.map((card, index) => ({
            name: `#${offset + index + 1}, ${card.cardType.name}`,
            value: `\`${card.id}\`, condition: ${CardQuality[card.quality].toLowerCase()}`
          }))
        )
        .setFooter({
          text: `Showing cards ${offset + 1}-${offset + limit + 1} of ${numCards}`
        });

      return {
        embed,
        total: numCards
      };
    });
  }

  async burn(message: Message, [cardId]: string[]) {
    let card: CardEntity;
    const member = await this.memberService.getOrCreateFromMember(message.member);
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
      .setDescription(
        [
          `${message.member.toString()} you will receive:`,
          "",
          `💰 **${value}**  Gold`
        ]
          .join("\n")
      );


    await message.reply({
      embeds: [embed]
    });
  }


}