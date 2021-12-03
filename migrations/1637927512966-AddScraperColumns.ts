import {MigrationInterface, QueryRunner} from "typeorm";

export class AddScraperColumns1637927512966 implements MigrationInterface {
    name = 'AddScraperColumns1637927512966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "revenueClaimed" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier_nft" ADD "claimed" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier_nft" DROP COLUMN "claimed"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "revenueClaimed"`);
    }

}
