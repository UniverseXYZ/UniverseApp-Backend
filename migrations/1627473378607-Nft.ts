import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1627473378607 implements MigrationInterface {
    name = 'Nft1627473378607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "royalties"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "royalties" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "royalties"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "royalties" real`);
    }

}
