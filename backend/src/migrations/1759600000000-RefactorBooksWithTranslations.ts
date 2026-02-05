import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorBooksWithTranslations1759600000000
  implements MigrationInterface
{
  name = 'RefactorBooksWithTranslations1759600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. book_languages tablosunun zaten book_translations olarak değişip değişmediğini kontrol et
    const translationsTableExists =
      await queryRunner.hasTable('book_translations');
    if (translationsTableExists) {
      console.log(
        '✅ book_translations tablosu zaten mevcut, migration atlanıyor.',
      );
      return;
    }

    // 2. Mevcut books tablosundaki verileri yedekle
    await queryRunner.query(`
            CREATE TABLE \`books_backup\` AS SELECT * FROM \`books\`
        `);

    // 3. book_languages tablosunu book_translations olarak yeniden adlandır
    await queryRunner.query(`
            RENAME TABLE \`book_languages\` TO \`book_translations\`
        `);

    // 4. book_translations tablosuna yeni kolonları ekle
    await queryRunner.query(`
            ALTER TABLE \`book_translations\`
            ADD COLUMN \`title\` varchar(255) NULL AFTER \`languageId\`,
            ADD COLUMN \`description\` text NULL AFTER \`title\`,
            ADD COLUMN \`summary\` text NULL AFTER \`description\`
        `);

    // 5. Mevcut books tablosundaki title, description, summary verilerini
    //    ilgili book_translations kayıtlarına kopyala
    await queryRunner.query(`
            UPDATE \`book_translations\` bt
            INNER JOIN \`books_backup\` b ON bt.bookId = b.id
            SET 
                bt.title = b.title,
                bt.description = b.description,
                bt.summary = b.summary
        `);

    // 6. books tablosundan artık book_translations'a taşınan kolonları kaldır
    await queryRunner.query(`
            ALTER TABLE \`books\`
            DROP COLUMN \`title\`,
            DROP COLUMN \`description\`,
            DROP COLUMN \`summary\`
        `);

    // 7. Yedek tabloyu sil
    await queryRunner.query(`DROP TABLE \`books_backup\``);

    console.log('✅ Kitaplar başarıyla çoklu dil yapısına dönüştürüldü.');
    console.log(
      '📝 Artık her dil için ayrı title, description ve summary girebilirsiniz.',
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

    // İlk dil kaydındaki verileri books tablosuna geri taşı
    // (Birden fazla dil varsa sadece ilkini alır, veri kaybı olabilir!)
    await queryRunner.query(`
            UPDATE \`books\` b
            INNER JOIN (
                SELECT bookId, title, description, summary
                FROM \`book_translations\`
                GROUP BY bookId
            ) bt ON b.id = bt.bookId
            SET 
                b.title = bt.title,
                b.description = bt.description,
                b.summary = bt.summary
        `);

    // book_translations tablosundan yeni kolonları kaldır
    await queryRunner.query(`
            ALTER TABLE \`book_translations\`
            DROP COLUMN \`title\`,
            DROP COLUMN \`description\`,
            DROP COLUMN \`summary\`
        `);

    // Tablo ismini geri değiştir
    await queryRunner.query(`
            RENAME TABLE \`book_translations\` TO \`book_languages\`
        `);

    console.log(
      '⚠️ Migration geri alındı. Çoklu dil verileri kaybolmuş olabilir!',
    );
  }
}
