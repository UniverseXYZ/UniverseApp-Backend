import {MigrationInterface, QueryRunner} from "typeorm";

export class UniverseBackendSchema1632480719937 implements MigrationInterface {
    name = 'UniverseBackendSchema1632480719937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "universe-backend"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "universe-backend"`);
    }

}
