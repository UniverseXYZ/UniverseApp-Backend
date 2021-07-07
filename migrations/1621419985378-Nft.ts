import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1621419985378 implements MigrationInterface {
    name = 'Nft1621419985378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`create type nft_source_enum as enum ('universe', 'scraper');`)
        await queryRunner.query(`CREATE TABLE "nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL,
            "collectionId" integer,
            "source" "nft_source_enum" NOT NULL DEFAULT 'universe', 
            "editionUUID" character varying,
            "txHash" character varying,
            "name" character varying, 
            "description" character varying, 
            "tokenId" character varying, 
            "tokenUri" character varying,
            "properties" jsonb, 
            "royalties" real, 
            "artworkType" character varying, 
            "url" character varying,
            "optimized_url" character varying, 
            "thumbnail_url" character varying, 
            "original_url" character varying, 
            "refreshed" boolean NOT NULL DEFAULT true, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nft"`);
    }
}
