import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingCollection1625494027436 implements MigrationInterface {
    name = 'MintingCollection1625494027436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "minting_collection" (
            "id" SERIAL NOT NULL, 
            "userId" integer NOT NULL, 
            "name" character varying NOT NULL, 
            "symbol" character varying NOT NULL, 
            "description" character varying, 
            "shortUrl" character varying, 
            "coverUrl" character varying, 
            "txHash" character varying, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_fed01b02eeb0a0f902b5b19fdfc" PRIMARY KEY ("id"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "minting_collection"`);
    }
}
