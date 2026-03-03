import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlagUrlToLanguages1772000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE languages ADD COLUMN flagUrl varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE languages DROP COLUMN flagUrl`);
  }
}
