import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixBookLanguagesColumnNames1749000000008
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE book_languages CHANGE language_id languageId int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE book_languages CHANGE languageId language_id int NULL`,
    );
  }
}
