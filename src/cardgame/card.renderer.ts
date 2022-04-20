import { Injectable } from "@nestjs/common";
import { createCanvas, loadImage } from "canvas";
import * as superagent from "superagent";
import { CardEntity } from "./card.entity";


@Injectable()
export class CardRenderer {

  async renderCard(card: CardEntity): Promise<Buffer> {
    const canvas = createCanvas(250, 350);
    const ctx = canvas.getContext("2d");
    const [overlay, avatar, star, starYellow] = await Promise.all([
      loadImage("media/card_1.png"),
      loadImage((await superagent.get(card.cardType.picture)).body as Buffer),
      loadImage("media/star-solid.svg"),
      loadImage("media/star-gold.svg")
    ]);

    ctx.drawImage(avatar, 12, 12, 225, 225);
    ctx.drawImage(overlay, 0, 0, 250, 350);

    ctx.fillStyle = "black";
    ctx.textBaseline = "top";
    ctx.font = "regular 15pt Arial";
    ctx.fillText(card.cardType.name, 12, 240);

    ctx.font = "regular 12pt Arial";
    ctx.fillText(`Ranked maps: ${card.cardType.numRankedMaps}`, 12, 270);
    ctx.fillText(`Subscribers: ${card.cardType.numMappingSubscribers}`, 12, 290);
    ctx.fillText(`Favorites: ${card.cardType.numFavorites}`, 12, 310);

    let rating = card.rarityLevel;
    for (let i = 0; i < 4; i++) {
      if (i < rating) {
        ctx.drawImage(starYellow, 168 + i * 20, 3, 18, 18);
      } else {
        ctx.drawImage(star, 168 + i * 20, 3, 18, 18);
      }

    }

    return canvas.toBuffer("image/png");
  }


}