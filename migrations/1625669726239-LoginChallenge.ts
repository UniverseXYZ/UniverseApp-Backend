import {MigrationInterface, QueryRunner} from "typeorm";

export class LoginChallenge1625669726239 implements MigrationInterface {
  name = 'LoginChallenge1625669726239'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create index "login_challenge_uuid_index" on "login_challenge" (uuid)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "login_challenge_uuid_index"`);
  }
}
