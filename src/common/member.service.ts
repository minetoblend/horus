import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GuildMember, User } from "discord.js";
import { MemberEntity } from "./member.entity";
import * as AsyncLock from "async-lock";

const lock = new AsyncLock();

@Injectable()
export class MemberService {

  constructor(
    @InjectRepository(MemberEntity)
    private repository: Repository<MemberEntity>
  ) {
  }

  locked(fn: (() => Promise<any>)) {
    lock.acquire("member", (done) => {
      fn().finally(done());
    });
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

  update(...members: MemberEntity[]) {
    return this.repository.save(members);
  }


  async findByIdOrCreate(id: string) {
    let entity = await this.repository.findOneBy({ id });
    if (!entity) {
      entity = new MemberEntity();
      entity.id = id;
      await this.update(entity);
    }
    return entity;  }
}