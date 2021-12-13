import {MigrationInterface, QueryRunner} from "typeorm";

export class AuctionBid1634645086422 implements MigrationInterface {
    name = 'AuctionBid1634645086422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`DROP INDEX "universe-backend"."IDX_user_address"`);
        await queryRunner.query(`CREATE TABLE "universe-backend"."auction_bid" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "auctionId" integer NOT NULL, "amount" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_022e4f8fe9416b6f1e13c55cdfb" PRIMARY KEY ("id"))`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier_nft" ALTER COLUMN "slot" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "tx_hash"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "tx_hash" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "token_name"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "token_name" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "token_symbol"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "token_symbol" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "contract_address"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "contract_address" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "block_timestamp"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "block_timestamp" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "included_in_block"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "included_in_block" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "processed" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "processed" DROP DEFAULT`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "owner"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "owner" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "created_at" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "created_at" DROP DEFAULT`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "tx_hash"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "tx_hash" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "token_id"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "token_id" integer NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "token_uri"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "token_uri" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "processed" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "processed" DROP DEFAULT`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "receiver" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "block_timestamp"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "block_timestamp" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "included_in_block"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "included_in_block" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "created_at" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "created_at" DROP DEFAULT`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "txStatus"`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "txStatus" character`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ALTER COLUMN "name" SET NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "txStatus"`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "txStatus" character`);
        // await queryRunner.query(`CREATE INDEX "IDX_2aa909b5dc7ce4773a85ce6a2b" ON "universe-backend"."user" ("address") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`DROP INDEX "universe-backend"."IDX_2aa909b5dc7ce4773a85ce6a2b"`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" DROP COLUMN "txStatus"`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ADD "txStatus" character varying`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_nft" ALTER COLUMN "name" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" DROP COLUMN "txStatus"`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."minting_collection" ADD "txStatus" character varying`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "created_at" SET DEFAULT now()`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "created_at" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "included_in_block"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "included_in_block" bigint NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "block_timestamp"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "block_timestamp" bigint NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "receiver" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "processed" SET DEFAULT false`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ALTER COLUMN "processed" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "token_uri"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "token_uri" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "token_id"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "token_id" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" DROP COLUMN "tx_hash"`);
        // await queryRunner.query(`ALTER TABLE "minted_nfts" ADD "tx_hash" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "created_at" SET DEFAULT now()`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "created_at" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "owner"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "owner" text`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "processed" SET DEFAULT false`);
        // await queryRunner.query(`ALTER TABLE "universe" ALTER COLUMN "processed" DROP NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "included_in_block"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "included_in_block" bigint NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "block_timestamp"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "block_timestamp" bigint NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "contract_address"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "contract_address" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "token_symbol"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "token_symbol" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "token_name"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "token_name" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe" DROP COLUMN "tx_hash"`);
        // await queryRunner.query(`ALTER TABLE "universe" ADD "tx_hash" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "universe-backend"."reward_tier_nft" ALTER COLUMN "slot" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "universe-backend"."auction_bid"`);
        // await queryRunner.query(`CREATE INDEX "IDX_user_address" ON "universe-backend"."user" ("address") `);
    }

}
