import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { CommonModule } from "../common/common.module";
import { CardgameGateway } from "./cardgame.gateway";

@Module({
  imports: [DiscordModule.forFeature(), CommonModule],
  providers: [CardgameGateway]
})
export class CardgameModule {
}
