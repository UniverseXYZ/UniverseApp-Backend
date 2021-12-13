import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionBid1637934536635 implements MigrationInterface {
    name = 'AuctionBid1637934536635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "bidder" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "bidder"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "userId" integer NOT NULL`);
    }

}
