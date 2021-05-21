import {MigrationInterface, QueryRunner} from "typeorm";

export class NftCollection1621419985378 implements MigrationInterface {
  name = 'NftCollection1621419985378'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create type nft_collection_source_enum as enum ('universe', 'scraper');`);
    await queryRunner.query(`alter type nft_collection_source_enum owner to postgresusername;`);

    await queryRunner.query(`CREATE TABLE "nft_collection" (
      "id" SERIAL NOT NULL,
      "userId" integer NOT NULL,
      "source" "nft_collection_source_enum" NOT NULL DEFAULT 'universe',
      "txHash" character varying,
      "onChain" boolean NOT NULL DEFAULT false,
      "address" character varying,
      "name" character varying NOT NULL,
      "symbol" character varying,
      "description" character varying,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_ffe58aa05707db77c2f20ecdbc3" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nft_collection"`);
  }

}
