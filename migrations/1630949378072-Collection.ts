import {MigrationInterface, QueryRunner} from "typeorm";

export class Collection1630949378072 implements MigrationInterface {
    name = 'Collection1630949378072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "bannerUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "bannerUrl"`);
    }

}
