import {MigrationInterface, QueryRunner} from "typeorm";

export class User1633264272647 implements MigrationInterface {
    name = 'User1633264272647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."user" (
            "id" SERIAL NOT NULL, 
            "address" character varying NOT NULL, 
            "profileImageName" character varying NOT NULL DEFAULT '', 
            "logoImageName" character varying NOT NULL DEFAULT '', 
            "displayName" character varying NOT NULL DEFAULT '', 
            "universePageUrl" character varying NOT NULL DEFAULT '', 
            "about" character varying NOT NULL DEFAULT '', 
            "instagramUser" character varying NOT NULL DEFAULT '', 
            "twitterUser" character varying NOT NULL DEFAULT '',
            "isActive" boolean NOT NULL DEFAULT true, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_b24c64be399e198f1efb2201f48" PRIMARY KEY ("id"))
        `);
        await queryRunner.query(`CREATE INDEX "IDX_user_address" ON "universe-backend"."user" ("address") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "universe-backend"."IDX_user_address"`);
        await queryRunner.query(`DROP TABLE "universe-backend"."user"`);
    }

}
