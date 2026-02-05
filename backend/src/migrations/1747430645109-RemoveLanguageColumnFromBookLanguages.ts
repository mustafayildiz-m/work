import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLanguageColumnFromBookLanguages1747430645109
  implements MigrationInterface
{
  name = 'RemoveLanguageColumnFromBookLanguages1747430645109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` DROP COLUMN \`language\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book_languages\` ADD \`language\` varchar(255) NOT NULL`,
    );
  }
}
