import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("guild")
export class GuildEntity {

  @PrimaryColumn()
  id: string;

  @Column({ default: "$" })
  prefix: string;

  @Column({ nullable: true })
  botChannel: string;

}