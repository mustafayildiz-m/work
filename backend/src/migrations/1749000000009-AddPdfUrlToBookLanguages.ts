import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPdfUrlToBookLanguages1749000000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE book_languages ADD COLUMN pdfUrl varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE book_languages DROP COLUMN pdfUrl`);
  }
}
