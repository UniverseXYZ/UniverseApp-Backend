import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1633264590439 implements MigrationInterface {
    name = 'Nft1633264590439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_source_enum" AS ENUM('universe', 'scraper')`);
        await queryRunner.query(`CREATE TABLE "universe-backend"."nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "collectionId" integer NOT NULL, 
            "source" "universe-backend"."nft_source_enum" NOT NULL DEFAULT 'universe', 
            "txHash" character varying, 
            "editionUUID" character varying, 
            "creator" character varying, "name" character varying, 
            "description" character varying, 
            "tokenId" integer, 
            "artworkType" character varying, 
            "url" character varying, 
            "optimized_url" character varying, 
            "thumbnail_url" character varying, 
            "original_url" character varying, 
            "tokenUri" character varying, 
            "properties" jsonb, 
            "royalties" jsonb, 
            "numberOfEditions" integer, 
            "refreshed" boolean NOT NULL DEFAULT true, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_2fac9db369526c92b42d2481fea" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_076b810e58fd4620f94801eced" ON "universe-backend"."nft" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_076b810e58fd4620f94801eced"`);
        await queryRunner.query(`DROP TABLE "universe-backend"."nft"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_source_enum"`);
    }

}
