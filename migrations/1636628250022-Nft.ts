import { MigrationInterface, QueryRunner } from 'typeorm';

export class Nft1636628250022 implements MigrationInterface {
  name = 'Nft1636628250022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "tokenId" TYPE character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "universe-backend"."nft" ALTER COLUMN "tokenId" TYPE integer USING "tokenId"::integer`,
    );
  }
}
