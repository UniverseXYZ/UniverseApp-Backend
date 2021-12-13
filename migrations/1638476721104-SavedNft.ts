import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1638476721104 implements MigrationInterface {
    name = 'SavedNft1638476721104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."saved_nft_metadatastorage_enum" AS ENUM('onchain', 'offchain')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."saved_nft" ADD "metadataStorage" "universe-backend"."saved_nft_metadatastorage_enum" NOT NULL DEFAULT 'onchain'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."saved_nft" DROP COLUMN "metadataStorage"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."saved_nft_metadatastorage_enum"`);
    }

}
