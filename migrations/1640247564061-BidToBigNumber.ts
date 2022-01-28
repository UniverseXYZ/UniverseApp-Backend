import {MigrationInterface, QueryRunner} from "typeorm";

export class BidToBigNumber1640247564061 implements MigrationInterface {
    name = 'BidToBigNumber1640247564061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "amount" bigint`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "revenueClaimed"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "revenueClaimed" bigint`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "decimalPlaces" integer`);
      }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "decimalPlaces"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "revenueClaimed"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "revenueClaimed" numeric(10,10) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "amount" numeric(10,10) DEFAULT '0'`);
    }

}
