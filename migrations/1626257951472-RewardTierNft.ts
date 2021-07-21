import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTierNft1626257951472 implements MigrationInterface {
  name = 'RewardTierNft1626257951472'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "reward_tier_nft" (
            "id" SERIAL NOT NULL, 
            "rewardTierId" integer NOT NULL, 
            "nftId" integer NOT NULL, 
            "deposited" boolean NOT NULL DEFAULT false, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_4504471d8f6839d6a928a2141ce" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reward_tier_nft"`);
  }
}
