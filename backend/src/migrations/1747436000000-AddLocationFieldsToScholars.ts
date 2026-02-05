import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationFieldsToScholars1747436000000
  implements MigrationInterface
{
  name = 'AddLocationFieldsToScholars1747436000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE scholars
            ADD COLUMN latitude DECIMAL(10,8) NULL,
            ADD COLUMN longitude DECIMAL(11,8) NULL,
            ADD COLUMN locationName TEXT NULL,
            ADD COLUMN locationDescription TEXT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE scholars
            DROP COLUMN latitude,
            DROP COLUMN longitude,
            DROP COLUMN locationName,
            DROP COLUMN locationDescription
        `);
  }
}
