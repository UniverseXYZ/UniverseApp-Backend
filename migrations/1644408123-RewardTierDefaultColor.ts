import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTierDefaultColor1644408123 implements MigrationInterface {
    name = 'RewardTierDefaultColor1644408123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "universe-backend"."reward_tier" SET "color" = '#EABD16' WHERE "color" IS NULL`);

     }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
