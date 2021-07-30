import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1627641336572 implements MigrationInterface {
    name = 'SavedNft1627641336572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" DROP COLUMN "tokenUris"`);
        await queryRunner.query(`ALTER TABLE "saved_nft" ADD "tokenUri" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" DROP COLUMN "tokenUri"`);
        await queryRunner.query(`ALTER TABLE "saved_nft" ADD "tokenUris" jsonb NOT NULL DEFAULT '[]'`);
    }
}
