import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublishDateToBooks1749000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE books ADD COLUMN publishDate DATE NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books DROP COLUMN publishDate`);
  }
}
