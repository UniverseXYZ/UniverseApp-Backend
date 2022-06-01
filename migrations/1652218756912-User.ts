import {MigrationInterface, QueryRunner} from "typeorm";

export class User1652218756912 implements MigrationInterface {
    name = 'User1652218756912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD "xeenonDescription" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD "hadronDescription" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP COLUMN "hadronDescription"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP COLUMN "xeenonDescription"`);
    }

}
