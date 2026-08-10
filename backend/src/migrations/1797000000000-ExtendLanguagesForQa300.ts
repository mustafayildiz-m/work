import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendLanguagesForQa3001797000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE languages
        ADD COLUMN nativeName VARCHAR(100) NULL AFTER name,
        ADD COLUMN englishName VARCHAR(100) NULL AFTER nativeName,
        ADD COLUMN iso639_3 CHAR(3) NULL AFTER code,
        ADD COLUMN direction ENUM('ltr','rtl') NOT NULL DEFAULT 'ltr' AFTER iso639_3,
        ADD COLUMN aliases TEXT NULL AFTER direction,
        ADD COLUMN parentLanguageId INT NULL AFTER aliases,
        ADD COLUMN questionCount INT NOT NULL DEFAULT 0 AFTER parentLanguageId,
        ADD COLUMN status ENUM('active','in_progress','not_published') NOT NULL DEFAULT 'not_published' AFTER questionCount
    `);

    await queryRunner.query(`
      ALTER TABLE languages
        ADD UNIQUE INDEX idx_iso639_3 (iso639_3),
        ADD INDEX idx_parent_language (parentLanguageId),
        ADD INDEX idx_status (status),
        ADD INDEX idx_question_count (questionCount),
        ADD CONSTRAINT fk_lang_parent
          FOREIGN KEY (parentLanguageId) REFERENCES languages(id) ON DELETE SET NULL
    `);

    // FULLTEXT index for search
    await queryRunner.query(`
      ALTER TABLE languages
        ADD FULLTEXT INDEX ft_lang_search (nativeName, englishName, aliases)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE languages DROP FOREIGN KEY fk_lang_parent`,
    );
    await queryRunner.query(
      `ALTER TABLE languages DROP INDEX ft_lang_search`,
    );
    await queryRunner.query(
      `ALTER TABLE languages DROP INDEX idx_question_count`,
    );
    await queryRunner.query(`ALTER TABLE languages DROP INDEX idx_status`);
    await queryRunner.query(
      `ALTER TABLE languages DROP INDEX idx_parent_language`,
    );
    await queryRunner.query(
      `ALTER TABLE languages DROP INDEX idx_iso639_3`,
    );
    await queryRunner.query(`
      ALTER TABLE languages
        DROP COLUMN status,
        DROP COLUMN questionCount,
        DROP COLUMN parentLanguageId,
        DROP COLUMN aliases,
        DROP COLUMN direction,
        DROP COLUMN iso639_3,
        DROP COLUMN englishName,
        DROP COLUMN nativeName
    `);
  }
}
