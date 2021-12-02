import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingNft1638406946248 implements MigrationInterface {
    name = 'MintingNft1638406946248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."minting_nft_tokenuristorage_enum" AS ENUM('onchain', 'offchain')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "tokenUriStorage" "universe-backend"."minting_nft_tokenuristorage_enum" NOT NULL DEFAULT 'offchain'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "tokenUriStorage"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."minting_nft_tokenuristorage_enum"`);
    }

}
