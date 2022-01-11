import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1640054256321 implements MigrationInterface {
    name = 'Nft1640054256321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "original_url"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "thumbnail_url"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "optimized_url"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "url"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "artworkType"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "txHash"`);
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_status_enum" AS ENUM('saved', 'minting', 'minted')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "status" "universe-backend"."nft_status_enum" NOT NULL`);
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_metadatastorage_enum" AS ENUM('onchain', 'offchain')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "metadataStorage" "universe-backend"."nft_metadatastorage_enum"`);        
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "licenseUri" character varying`);        
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "mintToOtherWallet" character varying(42)`);        
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "source" SET DEFAULT 'universe'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "collectionId" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_2d4535b902eed75d0deb2d515b" ON "universe-backend"."nft" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_2d4535b902eed75d0deb2d515b"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "collectionId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "source" SET DEFAULT 'universe'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "mintToOtherWallet"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "licenseUri"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "metadataStorage"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_metadatastorage_enum"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_status_enum"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "txHash" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "artworkType" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "url" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "optimized_url" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "thumbnail_url" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "original_url" character varying`);
        
    }

}
