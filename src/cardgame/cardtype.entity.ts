import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export type CardType = "mapper"

@Entity()
export class CardTypeEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: CardType;

  @Column()
  name: string;

  @Column()
  picture: string;

  @Column({ nullable: true })
  profileId?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  previousUsernames?: string;

}