import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionBidWithdraw1641916489551 implements MigrationInterface {
    name = 'AuctionBidWithdraw1641916489551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "withdrawn" boolean DEFAULT false`);
     }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "withdrawn"`);
    }

}
