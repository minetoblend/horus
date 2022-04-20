import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { CommonModule } from "../common/common.module";
import { CardgameGateway } from "./cardgame.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardTypeEntity } from "./cardtype.entity";
import { CardgameController } from "./cardgame.controller";
import { CardService } from "./card.service";
import { CardEntity } from "./card.entity";
import { CardRenderer } from "./card.renderer";
import { DropCommand } from "./drop.command";
import { BurnCommand } from "./burn.command";

@Module({
  imports: [DiscordModule.forFeature(), CommonModule, TypeOrmModule.forFeature([CardTypeEntity, CardEntity])],
  providers: [
    CardgameGateway,
    CardService,
    CardRenderer,

    //commands
    DropCommand,
    BurnCommand
  ],
  controllers: [CardgameController]
})
export class CardgameModule {
}
