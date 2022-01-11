import {MigrationInterface, QueryRunner} from "typeorm";

export class NftFile1640054256321 implements MigrationInterface {
    name = 'NftFile1640054256321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."nft_file" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "name" character varying, "description" character varying, "type" character varying, "url" character varying, "optimizedUrl" character varying, "thumbnailUrl" character varying, "originalUrl" character varying, "ipfsHash" character varying, "ipfs" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "nftId" integer, CONSTRAINT "PK_de33ec5cb45d75dcf32ddfdcdf2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_file" ADD CONSTRAINT "FK_90c9d3e2facdbe8326815cc46a9" FOREIGN KEY ("nftId") REFERENCES "universe-backend"."nft"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_file" DROP CONSTRAINT "FK_90c9d3e2facdbe8326815cc46a9"`);
        await queryRunner.query(`DROP TABLE "universe-backend"."nft_file"`);
    }

}
