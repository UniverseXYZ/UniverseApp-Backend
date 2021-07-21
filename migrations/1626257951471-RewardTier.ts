import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTier1626257951471 implements MigrationInterface {
  name = 'RewardTier1626257951471'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "reward_tier" (
            "id" SERIAL NOT NULL, 
            "auctionId" integer NOT NULL,
            "userId" integer NOT NULL, 
            "name" character varying NOT NULL, 
            "numberOfWinners" integer NOT NULL, 
            "nftsPerWinner" integer NOT NULL, 
            "minimumBid" numeric, 
            "tierPosition" integer NOT NULL, 
            "customDescription" character varying, 
            "tierImageUrl" character varying, 
            "tierColor" character varying, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_ddc1819239434dd8781ad28f5b6" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reward_tier"`);
  }
}
