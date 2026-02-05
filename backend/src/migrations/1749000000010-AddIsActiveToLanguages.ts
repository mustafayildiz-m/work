import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToLanguages1749000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE languages ADD COLUMN isActive boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE languages DROP COLUMN isActive`);
  }
}
