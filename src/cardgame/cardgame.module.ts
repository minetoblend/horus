import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { CommonModule } from "../common/common.module";
import { CardgameGateway } from "./cardgame.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardTypeEntity } from "./cardtype.entity";
import { CardgameController } from "./cardgame.controller";
import { CardService } from "./card.service";
import { CardEntity } from "./card.entity";

@Module({
  imports: [DiscordModule.forFeature(), CommonModule, TypeOrmModule.forFeature([CardTypeEntity, CardEntity])],
  providers: [CardgameGateway, CardService],
  controllers: [CardgameController]
})
export class CardgameModule {
}
