import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTier1633265715816 implements MigrationInterface {
    name = 'RewardTier1633265715816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."reward_tier" (
            "id" SERIAL NOT NULL, 
            "auctionId" integer NOT NULL, 
            "userId" integer NOT NULL, 
            "name" character varying NOT NULL, 
            "numberOfWinners" integer NOT NULL, 
            "nftsPerWinner" integer NOT NULL, 
            "minimumBid" numeric, 
            "tierPosition" integer NOT NULL, 
            "description" character varying, 
            "imageUrl" character varying, 
            "color" character varying, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_c551ad6d7e0b87fd8f24c869ed5" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."reward_tier"`);
    }
}
