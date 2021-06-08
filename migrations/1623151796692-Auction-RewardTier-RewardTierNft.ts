import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionRewardTierRewardTierNft1623151796692 implements MigrationInterface {
    name = 'AuctionRewardTierRewardTierNft1623151796692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auction" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "onChain" boolean NOT NULL DEFAULT false, "onChainId" integer, "txHash" character varying, "startingBid" integer NOT NULL, "bidCurrency" character varying NOT NULL DEFAULT 'ETH', "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "headline" character varying, "link" character varying, "promoImage" character varying, "backgroundImage" character varying, "backgroundBlur" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reward_tier_nft" ("id" SERIAL NOT NULL, "rewardTierId" integer NOT NULL, "nftId" integer NOT NULL, "deposited" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4504471d8f6839d6a928a2141ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reward_tier" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "numberOfWinners" integer NOT NULL, "nftsPerWinner" integer NOT NULL, "minimumBid" integer NOT NULL, "auctionId" integer NOT NULL, "tierPosition" integer NOT NULL, "customDescription" character varying, "tierImage" character varying, "tierColor" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ddc1819239434dd8781ad28f5b6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "reward_tier"`);
        await queryRunner.query(`DROP TABLE "reward_tier_nft"`);
        await queryRunner.query(`DROP TABLE "auction"`);
    }

}
