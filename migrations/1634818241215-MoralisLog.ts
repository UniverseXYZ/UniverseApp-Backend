import { MigrationInterface, QueryRunner} from "typeorm";

export class MoralisLog1634818241215 implements MigrationInterface {
    name = 'MoralisLog1634818241215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "universe-backend"."moralis_log" (
            "id" SERIAL NOT NULL, 
            "name" character varying NOT NULL, 
            "token" jsonb NOT NULL, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_5a6b69134b79c17de0b7eb603e9" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "universe-backend"."moralis_log"`);
    }

}
