import {MigrationInterface, QueryRunner} from "typeorm";

export class validations1640074627645 implements MigrationInterface {
    name = 'validations1640074627645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD CONSTRAINT "UQ_059e69c318702e93998f26d1528" UNIQUE ("displayName")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP CONSTRAINT "UQ_059e69c318702e93998f26d1528"`);
    }
}
