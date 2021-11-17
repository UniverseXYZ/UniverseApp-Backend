import {MigrationInterface, QueryRunner} from "typeorm";

export class Auction1636964980996 implements MigrationInterface {
    name = 'Auction1636964980996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" DROP COLUMN "startingBid"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ALTER COLUMN "source" SET DEFAULT 'universe'`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "source" SET DEFAULT 'universe'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft" ALTER COLUMN "source" SET DEFAULT 'universe'-backend".nft_source_enum`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ALTER COLUMN "source" SET DEFAULT 'universe'-backend".nft_collection_source_enum`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction" ADD "startingBid" numeric NOT NULL`);
    }

}
