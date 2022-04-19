import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GuildMember, User } from "discord.js";
import { MemberEntity } from "./member.entity";

@Injectable()
export class MemberService {

  constructor(
    @InjectRepository(MemberEntity)
    private repository: Repository<MemberEntity>
  ) {
  }

  async getOrCreateFromMember(member: GuildMember | User): Promise<MemberEntity> {
    let entity = await this.repository.findOneBy({ id: member.id });
    if (!entity) {
      entity = new MemberEntity();
      entity.id = member.id;
      await this.update(entity);
    }
    return entity;
  }

  update(guild: MemberEntity) {
    return this.repository.save(guild);
  }


}