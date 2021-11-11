import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1636628250022 implements MigrationInterface {
    name = 'Nft1636628250022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "tokenId"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "tokenId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "tokenId"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "tokenId" integer`);
    }

}
