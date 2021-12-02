import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1638406690881 implements MigrationInterface {
    name = 'SavedNft1638406690881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."saved_nft_tokenuristorage_enum" AS ENUM('onchain', 'offchain')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."saved_nft" ADD "tokenUriStorage" "universe-backend"."saved_nft_tokenuristorage_enum" NOT NULL DEFAULT 'offchain'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."saved_nft" DROP COLUMN "tokenUriStorage"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."saved_nft_tokenuristorage_enum"`);
    }

}
