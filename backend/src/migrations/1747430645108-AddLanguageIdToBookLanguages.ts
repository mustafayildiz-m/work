import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguageIdToBookLanguages1747430645108
  implements MigrationInterface
{
  name = 'AddLanguageIdToBookLanguages1747430645108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD \`language_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_book_languages_languages\` FOREIGN KEY (\`language_id\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_book_languages_languages\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP COLUMN \`language_id\``,
    );
  }
}
