import {MigrationInterface, QueryRunner} from "typeorm";

export class MintingNft1634120805663 implements MigrationInterface {
    name = 'MintingNft1634120805663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "txHash"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "txHashes" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "txHashes"`);
        await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "txHash" character varying`);
    }

}
