import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeScholarDatesToText1747437000000
  implements MigrationInterface
{
  name = 'ChangeScholarDatesToText1747437000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Önce mevcut tarihleri string'e çevir
    await queryRunner.query(`
            UPDATE scholars 
            SET birthDate = DATE_FORMAT(birthDate, '%Y-%m-%d')
            WHERE birthDate IS NOT NULL
        `);

    await queryRunner.query(`
            UPDATE scholars 
            SET deathDate = DATE_FORMAT(deathDate, '%Y-%m-%d')
            WHERE deathDate IS NOT NULL
        `);

    // Sütun tiplerini değiştir
    await queryRunner.query(`
            ALTER TABLE scholars
            MODIFY COLUMN birthDate TEXT NULL,
            MODIFY COLUMN deathDate TEXT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Sütun tiplerini geri al
    await queryRunner.query(`
            ALTER TABLE scholars
            MODIFY COLUMN birthDate DATE NULL,
            MODIFY COLUMN deathDate DATE NULL
        `);
  }
}
