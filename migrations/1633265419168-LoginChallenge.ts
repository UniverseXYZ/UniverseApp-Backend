import {MigrationInterface, QueryRunner} from "typeorm";

export class LoginChallenge1633265419168 implements MigrationInterface {
    name = 'LoginChallenge1633265419168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."login_challenge" (
            "id" SERIAL NOT NULL, 
            "uuid" character varying NOT NULL, 
            "challenge" character varying NOT NULL, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_cc2b4c2ffb1228df604e622e713" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."login_challenge"`);
    }

}
