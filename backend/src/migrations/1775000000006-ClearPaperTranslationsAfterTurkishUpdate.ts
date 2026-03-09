import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearPaperTranslationsAfterTurkishUpdate1775000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM paper_translations`);
  }

  public async down(): Promise<void> {
    // Cannot restore deleted translations
  }
}
