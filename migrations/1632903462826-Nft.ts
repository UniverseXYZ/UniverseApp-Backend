import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1632903462826 implements MigrationInterface {
    name = 'Nft1632903462826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "creator" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "creator"`);
    }

}
