import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOnChainSlotIndex1638189305603 implements MigrationInterface {
    name = 'AddOnChainSlotIndex1638189305603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" ADD "onChainSlotIndex" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "universe-backend"."auction_bid" DROP COLUMN "onChainSlotIndex"`);
    }

}
