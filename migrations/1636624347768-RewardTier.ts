import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTier1636624347768 implements MigrationInterface {
    name = 'RewardTier1636624347768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" DROP COLUMN "minimumBid"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" ADD "slots" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" DROP COLUMN "slots"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" ADD "minimumBid" numeric`);
    }

}
