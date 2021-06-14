import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1621419985378 implements MigrationInterface {
    name = 'Nft1621419985378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`create type nft_source_enum as enum ('universe', 'scraper');`)
        await queryRunner.query(`CREATE TABLE "nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "source" "nft_source_enum" NOT NULL DEFAULT 'universe', 
            "txHash" character varying, 
            "onChain" boolean NOT NULL DEFAULT false, 
            "name" character varying, 
            "tokenId" character varying, 
            "description" character varying, 
            "artwork_type" character varying, 
            "url" character varying, 
            "optimized_url" character varying, 
            "thumbnail_url" character varying, 
            "original_url" character varying, 
            "token_uri" character varying, 
            "properties" jsonb, 
            "royalties" real, 
            "refreshed" boolean NOT NULL DEFAULT true, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "collectionId" integer, 
            CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_941622072386aeece5112fe0db2" FOREIGN KEY ("collectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_941622072386aeece5112fe0db2"`);
        await queryRunner.query(`DROP TABLE "nft"`);
    }
}
