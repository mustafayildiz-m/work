import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSummaryToBooks1749000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books ADD COLUMN summary TEXT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books DROP COLUMN summary`);
  }
}
