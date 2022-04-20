import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuildEntity } from "./guild.entity";
import { GuildService } from "./guid.service";
import { MemberEntity } from "./member.entity";
import { MemberService } from "./member.service";
import { CommandGateway } from "./command.gateway";
import { DiscoveryModule } from "@nestjs/core";
import { HelpCommand } from "./help.command";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([GuildEntity, MemberEntity]),
    DiscoveryModule
  ],
  providers: [GuildService, MemberService, CommandGateway, HelpCommand],
  exports: [GuildService, MemberService]
})
export class CommonModule {
}
