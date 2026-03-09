import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsletterTranslationsAndSourceLanguage1775000000008
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE newsletters ADD COLUMN sourceLanguage varchar(10) NOT NULL DEFAULT 'tr'`,
    );

    await queryRunner.query(`
      CREATE TABLE newsletter_translations (
        id int NOT NULL AUTO_INCREMENT,
        newsletterId int NOT NULL,
        languageCode varchar(10) NOT NULL,
        title varchar(500) NOT NULL,
        intro text NULL,
        content longtext NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE INDEX IDX_newsletter_translations_lookup (newsletterId, languageCode),
        CONSTRAINT FK_newsletter_translations_newsletter
          FOREIGN KEY (newsletterId) REFERENCES newsletters(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS newsletter_translations`);
    await queryRunner.query(`ALTER TABLE newsletters DROP COLUMN sourceLanguage`);
  }
}
