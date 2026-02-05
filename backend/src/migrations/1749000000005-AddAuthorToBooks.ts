import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorToBooks1749000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE books ADD COLUMN author varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books DROP COLUMN author`);
  }
}
