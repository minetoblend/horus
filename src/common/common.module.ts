import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuildEntity } from "./guild.entity";
import { GuildService } from "./guid.service";
import { MemberEntity } from "./member.entity";
import { MemberService } from "./member.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([GuildEntity, MemberEntity])
  ],
  providers: [GuildService, MemberService],
  exports: [GuildService, MemberService]
})
export class CommonModule {
}
