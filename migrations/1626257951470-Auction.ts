import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1626257951470 implements MigrationInterface {
    name = 'Auction1626257951470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "auction" (
                "id" SERIAL NOT NULL, 
                "userId" integer NOT NULL, 
                "name" character varying NOT NULL, 
                "headline" character varying, 
                "startingBid" numeric NOT NULL, 
                "tokenAddress" character varying NOT NULL, 
                "tokenSymbol" character varying NOT NULL, 
                "tokenDecimals" integer NOT NULL, 
                "startDate" TIMESTAMP NOT NULL, 
                "endDate" TIMESTAMP NOT NULL, 
                "royaltySplits" jsonb, 
                "link" character varying, 
                "promoImageUrl" character varying, 
                "backgroundImageUrl" character varying, 
                "backgroundImageBlur" boolean NOT NULL DEFAULT false, 
                "onChain" boolean NOT NULL DEFAULT false, 
                "onChainId" integer, 
                "txHash" character varying, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auction"`);
    }
}
