import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * scholars.biography kolonunu TEXT (65 KB) -> LONGTEXT (4 GB) yapar.
 *
 * Gerekçe: PDF kaynaklı import sırasında bazı meşhur âlimlerin biyografileri
 * (İMÂM-I RABBÂNÎ 261K char, İMÂM-I GAZÂLÎ 215K char, vb.) 65K sınırını aşıyor.
 */
export class ChangeScholarBiographyToLongtext1779000000000
  implements MigrationInterface
{
  name = 'ChangeScholarBiographyToLongtext1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholars\` MODIFY COLUMN \`biography\` LONGTEXT NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`scholars\` MODIFY COLUMN \`biography\` TEXT NOT NULL`,
    );
  }
}
