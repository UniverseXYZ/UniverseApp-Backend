import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1632134497098 implements MigrationInterface {
    name = 'Nft1632134497098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "numberOfEditions" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "numberOfEditions"`);
    }

}
