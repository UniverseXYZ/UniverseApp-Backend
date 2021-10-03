import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTierNft1633265581286 implements MigrationInterface {
    name = 'RewardTierNft1633265581286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."reward_tier_nft" (
            "id" SERIAL NOT NULL, 
            "rewardTierId" integer NOT NULL, 
            "nftId" integer NOT NULL, 
            "deposited" boolean NOT NULL DEFAULT false, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_aadc54b0469b9adc0bea43b25bc" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."reward_tier_nft"`);
    }

}
