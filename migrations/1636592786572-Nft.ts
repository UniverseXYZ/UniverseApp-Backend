import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1636592786572 implements MigrationInterface {
    name = 'Nft1636592786572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "amount" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "amount"`);
    }

}
