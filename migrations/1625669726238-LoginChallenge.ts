import {MigrationInterface, QueryRunner} from "typeorm";

export class LoginChallenge1625669726238 implements MigrationInterface {
    name = 'LoginChallenge1625669726238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "login_challenge" (
            "id" SERIAL NOT NULL, 
            "uuid" character varying NOT NULL, 
            "challenge" character varying NOT NULL, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_179c2cb373394f4f74956209237" PRIMARY KEY ("id"))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "login_challenge"`);
    }

}
