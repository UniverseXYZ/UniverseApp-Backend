import {MigrationInterface, QueryRunner} from "typeorm";

export class MonitoredNfts1634632719818 implements MigrationInterface {
    name = 'MonitoredNfts1634632719818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."monitored_nfts" ADD COLUMN "id" SERIAL PRIMARY KEY`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."monitored_nfts" DROP COLUMN "id"`);
    }

}
