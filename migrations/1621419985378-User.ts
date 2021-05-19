import {MigrationInterface, QueryRunner} from "typeorm";

export class User1621419985378 implements MigrationInterface {
  name = 'User1621419985378'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user" (
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
      CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
