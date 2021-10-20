import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1634684873023 implements MigrationInterface {
    name = 'Nft1634684873023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ADD "owner" character varying(42)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" DROP COLUMN "owner"`);
    }

}
