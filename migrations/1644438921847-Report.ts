import {MigrationInterface, QueryRunner} from "typeorm";

export class Report1644438921847 implements MigrationInterface {
    name = 'Report1644438921847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."report" (
            "id" SERIAL NOT NULL, "userId" integer NOT NULL,
            "userAddress" character varying,
            "collectionAddress" character varying,
            "tokenId" character varying,
            "description" character varying,
            "reason" character varying,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."report"`);
    }

}
