import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GuildEntity } from "./guild.entity";
import { Repository } from "typeorm";
import { Guild } from "discord.js";

@Injectable()
export class GuildService {

  constructor(
    @InjectRepository(GuildEntity)
    private guildRepository: Repository<GuildEntity>
  ) {
  }

  async getOrCreateFromGuild(guild: Guild): Promise<GuildEntity> {
    let entity = await this.guildRepository.findOneBy({ id: guild.id });
    if (!entity) {
      entity = new GuildEntity();
      entity.id = guild.id;
      await this.update(entity);
    }
    return entity;
  }

  update(guild: GuildEntity) {
    return this.guildRepository.save(guild);
  }

}