import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublishDateAndSummaryToBooks1710000000000
  implements MigrationInterface
{
  name = 'AddPublishDateAndSummaryToBooks1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books ADD COLUMN summary TEXT NULL`);
    await queryRunner.query(
      `ALTER TABLE books ADD COLUMN publishDate DATE NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books DROP COLUMN publishDate`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN summary`);
  }
}
