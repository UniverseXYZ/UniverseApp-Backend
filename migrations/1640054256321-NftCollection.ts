import {MigrationInterface, QueryRunner} from "typeorm";

export class NftCollection1640054256321 implements MigrationInterface {
    name = 'NftCollection1640054256321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "userId" integer`);
        await queryRunner.query(`CREATE TYPE "universe-backend"."nft_collection_status_enum" AS ENUM('saved', 'deploying', 'deployed')`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "status" "universe-backend"."nft_collection_status_enum"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ALTER COLUMN "source" SET DEFAULT 'universe'`);
        await queryRunner.query(`CREATE INDEX "IDX_47fadffbc00b4d2ec3f08ae019" ON "universe-backend"."nft_collection" ("creator") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_47fadffbc00b4d2ec3f08ae019"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ALTER COLUMN "source" SET DEFAULT 'universe'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "universe-backend"."nft_collection_status_enum"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "userId"`);
                
    }

}
