import { Controller, Get } from "@nestjs/common";
import { CardTypeEntity } from "./cardtype.entity";
import { CardService } from "./card.service";
import { ConfigService } from "@nestjs/config";
import * as superagent from "superagent";
import * as FavoritesList from "../../media/favored-mappers.json";


@Controller("cardgame")
export class CardgameController {

  constructor(private cardService: CardService, private configService: ConfigService) {
  }

  mappers = [
    873961,//skystar
    5129592,//frostwich
    6411631,//maarvin
    3827077,//nhlx
    15111904,
    6063342,
    5194391,
    5387375,
    9331411,
    1314547,
    4109923,
    4673089,
    7262065,
    4468239,
    8617799,
    8271086,
    14261540,
    2123087
  ];

  @Get("init")
  async init() {
    await this.cardService.reset();

    let i = 0;
    const interval = setInterval(async () => {
      let mapper = FavoritesList[i++];
      if (!mapper) {
        clearInterval(interval);
        return;
      }

      try {
        const response = await superagent.get(`https://osu.ppy.sh/api/v2/users/${mapper.mapperId}`)
          .set("Authorization", `Bearer ${this.configService.get("OSU_ACCESS_TOKEN")}`);
        const profile = response.body;

        const numFavorites = Math.round(mapper.count);

        const cardType = new CardTypeEntity();
        cardType.type = "mapper";
        cardType.picture = profile.avatar_url;
        cardType.country = profile.country_url;
        cardType.name = profile.username;
        cardType.previousUsernames = (profile.previous_usernames || []).join(", ");
        cardType.profileId = profile.id;
        cardType.numRankedMaps = profile.ranked_beatmapset_count;
        cardType.numMappingSubscribers = profile.mapping_follower_count;
        cardType.followerCount = profile.follower_count;
        cardType.numFavorites = numFavorites;
        cardType.calculateDropChanceMultiplier();

        await this.cardService.updateCardType(cardType);

        console.log("created card for mapper " + cardType.name);
      } catch (e) {
        console.error(`Could not find profile for ${mapper.names[0]}`);
      }

    }, 100);

    return "success";
  }

  @Get("random")
  async getRandom() {
    return await this.cardService.getRandomType();
  }

}