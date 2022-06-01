import {MigrationInterface, QueryRunner} from "typeorm";

export class User1654119031603 implements MigrationInterface {
    name = 'User1654119031603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP COLUMN "xeenonDescription"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP COLUMN "hadronDescription"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD "hadronDescription" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD "xeenonDescription" character varying NOT NULL DEFAULT ''`);
    }

}
