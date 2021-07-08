import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1622721887340 implements MigrationInterface {
    name = 'SavedNft1622721887340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "saved_nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL,
            "collectionId" integer,
            "txHash" character varying,
            "tokenUris" jsonb NOT NULL DEFAULT '[]',
            "name" character varying NOT NULL, 
            "description" character varying, 
            "numberOfEditions" integer NOT NULL, 
            "properties" jsonb, 
            "royalties" real, 
            "artworkType" character varying, 
            "url" character varying, 
            "optimized_url" character varying, 
            "thumbnail_url" character varying, 
            "original_url" character varying, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP,
            CONSTRAINT "PK_0f944ae34743ee243f9e7223add" PRIMARY KEY ("id")
       )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "saved_nft"`);
    }

}
