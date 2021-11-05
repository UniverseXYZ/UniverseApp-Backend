import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1636110286127 implements MigrationInterface {
    name = 'Auction1636110286127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "claimedFunds" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "claimedFunds"`);
    }

}
