import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CardTypeEntity } from "./cardtype.entity";
import { IsNull, Not, Repository } from "typeorm";
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
      .orderBy("random()")
      .limit(1)
      .printSql()
      .getOne();
  }

  async reset() {
    await this.cardRepository.clear();
    await this.cardTypeRepository.clear();
  }

  async generateCardId(): Promise<string> {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    const length = 6;
    let card;
    let result;
    do {
      result = "";
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      card = await this.getCardById(result);
    } while (!!card);

    return result;
  }

  async createDrop(member: MemberEntity, name?: string) {
    let type = await this.getRandomType();
    if (name) {
      let newType = await this.cardTypeRepository.findOneBy({ name });
      if (newType)
        type = newType;
    }

    const drop = new CardEntity();
    drop.id = await this.generateCardId();
    drop.cardType = type;
    drop.droppedAt = new Date();
    drop.droppedBy = member;
    drop.quality = Math.floor(Math.random() * 5);
    await this.cardRepository.save(drop);
    return drop;
  }

  getCardById(id: string) {
    return this.cardRepository.findOneBy({ id });
  }

  getCardTypeByProfileId(profileId: string) {
    return this.cardTypeRepository.findOneBy({ profileId });
  }

  getCardTypeByName(name: string) {
    return this.cardTypeRepository.findOneBy({ name });
  }

  async claim(member: MemberEntity, drop: CardEntity) {
    drop.owner = member;
    drop.claimedAt = new Date();
    drop.ownedAt = new Date();
    await this.cardRepository.save(drop);
  }

  async getLatestCard(member: MemberEntity) {
    return this.cardRepository.findOne({
      where: { owner: member, ownedAt: Not(IsNull()), burnedAt: IsNull() },
      order: {
        ownedAt: "desc"
      }
    });
  }

  async getCardCountByMember(member: MemberEntity) {
    return this.cardRepository.countBy({
      owner: member,
      burnedAt: IsNull()
    });
  }

  async getCardsByMemberPaginated(member: MemberEntity, skip: number, take: number) {
    return this.cardRepository.find({
      where: { owner: member, burnedAt: IsNull() },
      order: { id: "desc" },
      skip,
      take
    });
  }

  async getAllCardTypes() {
    return this.cardTypeRepository.find();
  }

  async burnCard(card: CardEntity) {
    card.burnedAt = new Date();
    await this.cardRepository.save(card);
  }
}