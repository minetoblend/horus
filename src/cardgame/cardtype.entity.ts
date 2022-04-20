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

  @Column({ type: "int", default: 0 })
  numRankedMaps: number;

  @Column({ type: "int", default: 0 })
  numMappingSubscribers: number;

  @Column({ type: "int", default: 0 })
  followerCount: number;

  @Column({ type: "int", default: 0 })
  numFavorites: number;

  @Column({ type: "float", default: 1 })
  dropChanceMultiplier: number;

  calculateDropChanceMultiplier() {
    let multiplier = 1; //less = more rare

    const subscriberToFollowerRatio =
      (this.numMappingSubscribers || 1) / (this.followerCount || 1);

    if (subscriberToFollowerRatio > 1.5) //twice as rare
      multiplier *= 0.5;
    if (subscriberToFollowerRatio < 0.75) //half as rare
      multiplier *= 2;

    if (this.numFavorites > 100)
      multiplier *= 0.8;
    if (this.numFavorites > 200)
      multiplier *= 0.5;
    if (this.numFavorites > 400)
      multiplier *= 0.2;
    if (this.numFavorites > 600)
      multiplier *= 0.1;
    if (this.numFavorites > 800)
      multiplier *= 0.05;

    if (this.numRankedMaps > 12)
      multiplier *= 0.2;
    else if (this.numRankedMaps > 4)
      multiplier *= 0.3;
    else if (this.numRankedMaps > 0)
      multiplier *= 0.5;


    this.dropChanceMultiplier = Math.sqrt(multiplier);
  }

}