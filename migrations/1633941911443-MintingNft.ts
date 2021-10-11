import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingNft1633941911443 implements MigrationInterface {
    name = 'MintingNft1633941911443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "mintedEditions" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "mintedEditions"`);
    }

}
