import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GuildEntity } from "./guild.entity";
import { Repository } from "typeorm";
import { Guild } from "discord.js";
import * as AsyncLock from "async-lock";

const lock = new AsyncLock();

@Injectable()
export class GuildService {

  constructor(
    @InjectRepository(GuildEntity)
    private guildRepository: Repository<GuildEntity>
  ) {
  }

  async getOrCreateFromGuild(guild: Guild): Promise<GuildEntity> {
    let entity;

    await lock.acquire("member", async (done) => {
      entity = await this.guildRepository.findOneBy({ id: guild.id });
      if (!entity) {
        entity = new GuildEntity();
        entity.id = guild.id;
        await this.update(entity);
      }
      done();
    });


    return entity;
  }

  update(guild: GuildEntity) {
    return this.guildRepository.save(guild);
  }

}