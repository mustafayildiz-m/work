import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToLanguages1749000000011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE languages ADD COLUMN createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE languages ADD COLUMN updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE languages DROP COLUMN updatedAt`);
    await queryRunner.query(`ALTER TABLE languages DROP COLUMN createdAt`);
  }
}
