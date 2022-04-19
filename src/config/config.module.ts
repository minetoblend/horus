import { Module } from "@nestjs/common";
import { ConfigGateway } from "./config.gateway";
import { DiscordModule } from "@discord-nestjs/core";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [DiscordModule.forFeature(), CommonModule],
  providers: [ConfigGateway],
  exports: []
})
export class ConfigModule {
}
