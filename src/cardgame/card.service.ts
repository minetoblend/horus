import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CardTypeEntity } from "./cardtype.entity";
import { Repository } from "typeorm";
import { MemberEntity } from "../common/member.entity";
import { CardEntity } from "./card.entity";

@Injectable()
export class CardService {

  constructor(
    @InjectRepository(CardTypeEntity)
    private cardTypeRepository: Repository<CardTypeEntity>,
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>
  ) {
  }

  updateCardType(type: CardTypeEntity) {
    return this.cardTypeRepository.save(type);
  }

  getRandomType() {
    return this.cardTypeRepository
      .createQueryBuilder()
      .select()
      .orderBy("RANDOM()")
      .limit(1)
      .getOne();
  }

  reset() {
    return this.cardTypeRepository.clear();
  }

  async createDrop(member: MemberEntity) {
    const type = await this.getRandomType();
    const drop = new CardEntity();
    drop.cardType = type;
    drop.droppedAt = new Date();
    drop.droppedBy = member;
    drop.quality = Math.floor(Math.random() * 5);
    await this.cardRepository.save(drop);
    return drop;
  }

  getCardById(id: number) {
    return this.cardRepository.findOneBy({ id });
  }


  async claim(member: MemberEntity, drop: CardEntity) {
    drop.owner = member;
    drop.claimedAt = new Date();
    this.cardRepository.save(drop);
  }
}