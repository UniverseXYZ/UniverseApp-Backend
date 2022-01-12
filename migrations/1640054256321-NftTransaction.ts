import {MigrationInterface, QueryRunner} from "typeorm";

export class NftTransaction1640054256321 implements MigrationInterface {
    name = 'NftTransaction1640054256321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_transaction_status_enum" AS ENUM('pending', 'failed', 'success')`);
        await queryRunner.query(`CREATE TABLE "universe-backend"."nft_transaction" ("id" SERIAL NOT NULL, "status" "universe-backend"."nft_transaction_status_enum", "hash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "nftId" integer, CONSTRAINT "PK_ec99dc30788f40287971371429e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_transaction" ADD CONSTRAINT "FK_9530800a66872bf99bfee51454e" FOREIGN KEY ("nftId") REFERENCES "universe-backend"."nft"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_transaction" DROP CONSTRAINT "FK_9530800a66872bf99bfee51454e"`);
        await queryRunner.query(`DROP TABLE "universe-backend"."nft_transaction"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_transaction_status_enum"`);
    }

}
