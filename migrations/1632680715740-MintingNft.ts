import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingNft1632680715740 implements MigrationInterface {
    name = 'MintingNft1632680715740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."minting_nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "collectionId" integer,
            "savedNftId" integer, 
            "tokenUri" character varying, 
            "numberOfEditions" integer NOT NULL,
            "name" character varying, 
            "description" character varying,
            "properties" jsonb, 
            "royalties" jsonb, 
            "artworkType" character varying, 
            "url" character varying,
            "optimizedUrl" character varying, 
            "thumbnailUrl" character varying, 
            "originalUrl" character varying, 
            "txHash" character varying, 
            "txStatus" character varying,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_e6cf75b68e0b22c3c0e83f40c76" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."minting_nft"`);
    }
}
