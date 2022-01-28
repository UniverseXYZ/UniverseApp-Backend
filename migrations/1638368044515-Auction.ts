import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1638368044515 implements MigrationInterface {
    name = 'Auction1638368044515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "revenueClaimed"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "revenueClaimed" numeric DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "revenueClaimed"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "revenueClaimed" integer DEFAULT '0'`);
    }

}
