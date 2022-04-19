import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MemberEntity {

  @PrimaryColumn()
  id: string;

  @Column({ type: "int", default: 0 })
  gold: number;

  @Column({ type: "datetime", nullable: true })
  collectedDailyAt?: Date;

}