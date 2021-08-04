import {MigrationInterface, QueryRunner} from "typeorm";

export class NftCollection1627570944197 implements MigrationInterface {
    name = 'NftCollection1627570944197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "owner" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "owner"`);
    }
}
