import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingNft1638476996154 implements MigrationInterface {
    name = 'MintingNft1638476996154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."minting_nft_metadatastorage_enum" AS ENUM('onchain', 'offchain')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "metadataStorage" "universe-backend"."minting_nft_metadatastorage_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "metadataStorage"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."minting_nft_metadatastorage_enum"`);
    }

}
