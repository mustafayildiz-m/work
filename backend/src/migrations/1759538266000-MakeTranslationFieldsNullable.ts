import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTranslationFieldsNullable1759538266000
  implements MigrationInterface
{
  name = 'MakeTranslationFieldsNullable1759538266000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // status, translatedBy, approvedBy alanlarını nullable yap
    await queryRunner.query(`
            ALTER TABLE \`scholar_post_translations\` 
            MODIFY COLUMN \`status\` enum('draft', 'pending', 'approved') NULL
        `);

    console.log(
      '✅ Translation fields are now nullable for future moderation system.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alma: status için default değer ekle
    await queryRunner.query(`
            ALTER TABLE \`scholar_post_translations\` 
            MODIFY COLUMN \`status\` enum('draft', 'pending', 'approved') NOT NULL DEFAULT 'draft'
        `);
  }
}
