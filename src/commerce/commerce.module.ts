import { Module } from "@nestjs/common";
import { DiscordModule } from "@discord-nestjs/core";
import { CommonModule } from "../common/common.module";
import { DailyCommand } from "./daily.command";
import { CommerceCommands } from "./commerce.command";

@Module({
  imports: [DiscordModule.forFeature(), CommonModule],
  providers: [
    CommerceCommands,
    DailyCommand
  ],
  controllers: []
})
export class CommerceModule {
}
