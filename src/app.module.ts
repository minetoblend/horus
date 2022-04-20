import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DiscordModule } from "@discord-nestjs/core";
import { Intents } from "discord.js";
import { CommonModule } from "./common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardgameModule } from "./cardgame/cardgame.module";
import { ConfigModule as GuildConfigModule } from "./config/config.module";
import { CommerceModule } from "./commerce/commerce.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get("DISCORD_TOKEN"),
        prefix: "k",
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
        }
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db.sqlite",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true
    }),
    CommonModule,
    CardgameModule,
    ConfigModule,
    GuildConfigModule,
    CommerceModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
