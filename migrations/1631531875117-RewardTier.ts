import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTier1631531875117 implements MigrationInterface {
    name = 'RewardTier1631531875117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "customDescription" TO "description"`);
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "tierImageUrl" TO "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "tierColor" TO "color"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "description" TO "customDescription"`);
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "imageUrl" TO "tierImageUrl"`);
        await queryRunner.query(`ALTER TABLE "reward_tier" RENAME COLUMN "color" TO "tierColor"`);
    }

}
