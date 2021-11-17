import {MigrationInterface, QueryRunner} from "typeorm";

export class RewardTier1637050723586 implements MigrationInterface {
    name = 'RewardTier1637050723586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" DROP COLUMN "nftsPerWinner"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" ADD "nftsPerWinner" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" DROP COLUMN "nftsPerWinner"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier" ADD "nftsPerWinner" integer NOT NULL`);
    }

}
