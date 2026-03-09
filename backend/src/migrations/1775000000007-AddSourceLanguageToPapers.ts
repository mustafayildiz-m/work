import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceLanguageToPapers1775000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE papers ADD COLUMN sourceLanguage varchar(10) NOT NULL DEFAULT 'tr'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE papers DROP COLUMN sourceLanguage`);
  }
}
