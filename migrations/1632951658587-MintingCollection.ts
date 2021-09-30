import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingCollection1632951658587 implements MigrationInterface {
    name = 'MintingCollection1632951658587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."minting_collection" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "name" character varying NOT NULL, 
            "symbol" character varying NOT NULL, 
            "description" character varying, 
            "shortUrl" character varying, 
            "coverUrl" character varying, 
            "txHash" character varying, 
            "txStatus" character varying,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_4450ababba40989aa29a18053bb" PRIMARY KEY ("id"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."minting_collection"`);
    }

}
