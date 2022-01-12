import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionRevenue1641978539277 implements MigrationInterface {
    name = 'AuctionRevenue1641978539277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ALTER COLUMN "withdrawn" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ALTER COLUMN "revenueClaimed" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ALTER COLUMN "revenueClaimed" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ALTER COLUMN "withdrawn" DROP DEFAULT`);
    }

}
