import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverImageToBooks1716902086000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE books ADD COLUMN coverImage varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE books DROP COLUMN coverImage`);
  }
}
