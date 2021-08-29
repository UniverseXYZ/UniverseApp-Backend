import {MigrationInterface, QueryRunner} from "typeorm";

export class Collection1630248339765 implements MigrationInterface {
    name = 'Collection1630248339765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "publicCollection" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "publicCollection"`);
    }

}
