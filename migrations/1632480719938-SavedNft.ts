import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1632480719938 implements MigrationInterface {
    name = 'SavedNft1632480719938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."saved_nft" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "collectionId" integer NOT NULL, 
            "tokenUri" character varying, 
            "name" character varying NOT NULL, 
            "description" character varying, 
            "numberOfEditions" integer NOT NULL, 
            "artworkType" character varying, 
            "url" character varying, 
            "optimizedUrl" character varying,
            "thumbnailUrl" character varying, 
            "originalUrl" character varying, 
            "properties" jsonb, 
            "royalties" jsonb, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "deletedAt" TIMESTAMP, 
            CONSTRAINT "PK_29f76d9930876aa88c1e786c33b" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."saved_nft"`);
    }

}
