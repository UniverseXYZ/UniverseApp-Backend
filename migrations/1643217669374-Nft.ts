import { MigrationInterface, QueryRunner } from 'typeorm';

export class Nft1643217669374 implements MigrationInterface {
  name = 'Nft1643217669374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "animation_url" character varying`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "animation_original_url" character varying`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "background_color" character varying`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "external_link" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "external_link"`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "background_color"`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "animation_original_url"`);
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "animation_url"`);
  }
}
