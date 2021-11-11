import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1636643860781 implements MigrationInterface {
    name = 'Nft1636643860781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "standard" character varying NOT NULL DEFAULT 'ERC721'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "standard"`);
    }
}
