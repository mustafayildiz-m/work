import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPdfUrlToScholarOwnBooks1749000000010
  implements MigrationInterface
{
  name = 'AddPdfUrlToScholarOwnBooks1749000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholar_own_books\` ADD COLUMN \`pdfUrl\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholar_own_books\` DROP COLUMN \`pdfUrl\``,
    );
  }
}
