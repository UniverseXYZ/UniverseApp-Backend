import {MigrationInterface, QueryRunner} from "typeorm";

export class SavedNft1627461815640 implements MigrationInterface {
    name = 'SavedNft1627461815640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" DROP COLUMN "royalties"`);
        await queryRunner.query(`ALTER TABLE "saved_nft" ADD "royalties" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_nft" DROP COLUMN "royalties"`);
        await queryRunner.query(`ALTER TABLE "saved_nft" ADD "royalties" real`);
    }

}
