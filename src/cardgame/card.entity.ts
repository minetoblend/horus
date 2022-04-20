import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CardTypeEntity } from "./cardtype.entity";
import { MemberEntity } from "../common/member.entity";

export enum CardQuality {
  DAMAGED,
  POOR,
  GOOD,
  GREAT,
  MINT,
}

@Entity()
export class CardEntity {

  @PrimaryColumn()
  id: string;

  @ManyToOne(() => CardTypeEntity, { eager: true })
  cardType: CardTypeEntity;

  @ManyToOne(() => MemberEntity, { eager: true })
  droppedBy: MemberEntity;

  @ManyToOne(() => MemberEntity, { eager: true })
  owner: MemberEntity;

  @Column({ type: "datetime" })
  droppedAt: Date;

  @Column({ type: "datetime", nullable: true })
  claimedAt?: Date;

  @Column({ type: "datetime", nullable: true })
  ownedAt?: Date;

  @Column({ type: "datetime", nullable: true })
  burnedAt?: Date;

  @Column({ type: "int" })
  quality: CardQuality;

  get rarityLevel() {
    if (this.cardType.dropChanceMultiplier < 0.05)
      return 4;
    if (this.cardType.dropChanceMultiplier < 0.5)
      return 3;
    if (this.cardType.dropChanceMultiplier < 1)
      return 2;
    return 1;
  }

  get cardBurnValue() {
    let multiplier;
    switch (this.quality) {
      case CardQuality.DAMAGED:
        multiplier = 0.0625;
        break;
      case CardQuality.POOR:
        multiplier = 0.125;
        break;
      case CardQuality.GOOD:
        multiplier = 0.25;
        break;
      case CardQuality.GREAT:
        multiplier = 0.5;
        break;
      case CardQuality.MINT:
        multiplier = 1;
        break;
    }


    return Math.ceil(15 / this.cardType.dropChanceMultiplier * multiplier);
  }

}