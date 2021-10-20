import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionBid1634645086422 implements MigrationInterface {
    name = 'AuctionBid1634645086422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."auction_bid" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "auctionId" integer NOT NULL, "amount" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_022e4f8fe9416b6f1e13c55cdfb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."auction_bid"`);
    }

}
