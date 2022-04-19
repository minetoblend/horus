import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CardTypeEntity, {eager: true})
  cardType: CardTypeEntity;

  @ManyToOne(() => MemberEntity, {eager: true})
  droppedBy: MemberEntity;

  @ManyToOne(() => MemberEntity, {eager: true})
  owner: MemberEntity;

  @Column({ type: "datetime" })
  droppedAt: Date;

  @Column({ type: "datetime", nullable: true })
  claimedAt: Date;

  @Column({ type: "datetime", nullable: true })
  burnedAt: Date;

  @Column({ type: "int" })
  quality: CardQuality;

}