import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1636114113648 implements MigrationInterface {
    name = 'Auction1636114113648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "owner" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "createAuctionTxHash" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "onChainStartTime" bigint`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "onChainEndTime" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "onChainEndTime"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "onChainStartTime"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "createAuctionTxHash"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "owner"`);
    }
}
