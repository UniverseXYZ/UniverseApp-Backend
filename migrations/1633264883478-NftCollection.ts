import {MigrationInterface, QueryRunner} from "typeorm";

export class NftCollection1633264883478 implements MigrationInterface {
    name = 'NftCollection1633264883478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_collection_source_enum" AS ENUM('universe', 'scraper')`);
        await queryRunner.query(`CREATE TABLE "universe-backend"."nft_collection" (
            "id" SERIAL NOT NULL, 
            "source" "universe-backend"."nft_collection_source_enum" NOT NULL DEFAULT 'universe', 
            "txHash" character varying, 
            "address" character varying, 
            "owner" character varying, 
            "creator" character varying, 
            "name" character varying NOT NULL, 
            "symbol" character varying, 
            "description" character varying, 
            "shortUrl" character varying, 
            "coverUrl" character varying, 
            "bannerUrl" character varying, 
            "publicCollection" boolean NOT NULL DEFAULT false, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_aaf05e924ca396a6a45aa9bbc51" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_c26e8ae919f01383cfaa1d7bbf" ON "universe-backend"."nft_collection" ("owner") `);
        await queryRunner.query(`CREATE INDEX "IDX_ed7d9381e1e6278fb9208ae6db" ON "universe-backend"."nft_collection" ("creator") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_ed7d9381e1e6278fb9208ae6db"`);
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_c26e8ae919f01383cfaa1d7bbf"`);
        await queryRunner.query(`DROP TABLE "universe-backend"."nft_collection"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_collection_source_enum"`);
    }

}
