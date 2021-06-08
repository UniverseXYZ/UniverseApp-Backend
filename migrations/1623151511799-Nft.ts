import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1623151511799 implements MigrationInterface {
    name = 'Nft1623151511799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "editionUUID" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "editionUUID"`);
    }

}
