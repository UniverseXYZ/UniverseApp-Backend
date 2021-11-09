import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1636377754893 implements MigrationInterface {
    name = 'Auction1636377754893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "claimedFunds"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "claimedFunds"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "claimedFunds" integer NOT NULL DEFAULT '0'`);
    }

}
