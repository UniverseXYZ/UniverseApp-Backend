import {MigrationInterface, QueryRunner} from "typeorm";

export class CollectionUrls1643816073832 implements MigrationInterface {
    name = 'CollectionUrls1643816073832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "siteLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "discordLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "instagramLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "mediumLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" ADD "telegramLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "siteLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "discordLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "instagramLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "mediumLink" character varying`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "telegramLink" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "telegramLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "mediumLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "instagramLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "discordLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "siteLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "telegramLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "mediumLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "instagramLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "discordLink"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."nft_collection" DROP COLUMN "siteLink"`);
    }

}
