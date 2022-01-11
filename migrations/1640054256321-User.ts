import {MigrationInterface, QueryRunner} from "typeorm";

export class User1640054256321 implements MigrationInterface {
    name = 'User1640054256321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_3122b4b8709577da50e89b6898" ON "universe-backend"."user" ("address") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_3122b4b8709577da50e89b6898"`);                
    }

}
