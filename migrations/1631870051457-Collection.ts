import {MigrationInterface, QueryRunner} from "typeorm";

export class Collection1631870051457 implements MigrationInterface {
    name = 'Collection1631870051457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "creator" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "creator"`);
    }

}
