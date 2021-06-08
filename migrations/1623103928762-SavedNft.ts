import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1623103928762 implements MigrationInterface {
    name = 'SavedNft1623103928762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" ADD "editionUUID" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" DROP COLUMN "editionUUID"`);
    }

}
