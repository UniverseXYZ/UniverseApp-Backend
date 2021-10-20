import {MigrationInterface, QueryRunner} from "typeorm";

export class User1634632719817 implements MigrationInterface {
    name = 'User1634632719817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" ADD "moralisWatched" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."user" DROP COLUMN "moralisWatched"`);
    }

}
