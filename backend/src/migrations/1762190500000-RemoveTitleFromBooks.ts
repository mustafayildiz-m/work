import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTitleFromBooks1762190500000 implements MigrationInterface {
  name = 'RemoveTitleFromBooks1762190500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // books tablosunda title, description, summary kolonlarının var olup olmadığını kontrol et
    const table = await queryRunner.getTable('books');

    if (table?.findColumnByName('title')) {
      console.log('📝 books tablosundan title kolonu kaldırılıyor...');
      await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`title\``);
    }

    if (table?.findColumnByName('description')) {
      console.log('📝 books tablosundan description kolonu kaldırılıyor...');
      await queryRunner.query(
        `ALTER TABLE \`books\` DROP COLUMN \`description\``,
      );
    }

    if (table?.findColumnByName('summary')) {
      console.log('📝 books tablosundan summary kolonu kaldırılıyor...');
      await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
    }

    console.log(
      '✅ books tablosu güncellendi. Artık title, description ve summary book_translations tablosunda saklanıyor.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alma: books tablosuna kolonları geri ekle
    await queryRunner.query(`
            ALTER TABLE \`books\`
            ADD COLUMN \`title\` varchar(255) NULL,
            ADD COLUMN \`description\` text NULL,
            ADD COLUMN \`summary\` text NULL
        `);

    console.log(
      '⚠️ Migration geri alındı. title, description, summary kolonları books tablosuna geri eklendi.',
    );
  }
}
