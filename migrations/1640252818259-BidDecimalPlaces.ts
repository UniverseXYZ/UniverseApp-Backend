import {MigrationInterface, QueryRunner} from "typeorm";

export class BidDecimalPlaces1640252818259 implements MigrationInterface {
    name = 'BidDecimalPlaces1640252818259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "decimalPlaces" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "decimalPlaces"`);
    }

}
