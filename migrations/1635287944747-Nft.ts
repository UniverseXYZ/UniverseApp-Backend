import {MigrationInterface, QueryRunner} from "typeorm";

export class Nft1635287944747 implements MigrationInterface {
    name = 'Nft1635287944747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "userId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "userId" SET NOT NULL`);
    }

}
