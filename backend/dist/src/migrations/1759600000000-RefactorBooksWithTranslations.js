"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorBooksWithTranslations1759600000000 = void 0;
class RefactorBooksWithTranslations1759600000000 {
    constructor() {
        this.name = 'RefactorBooksWithTranslations1759600000000';
    }
    async up(queryRunner) {
        const translationsTableExists = await queryRunner.hasTable('book_translations');
        if (translationsTableExists) {
            console.log('✅ book_translations tablosu zaten mevcut, migration atlanıyor.');
            return;
        }
        await queryRunner.query(`
            CREATE TABLE \`books_backup\` AS SELECT * FROM \`books\`
        `);
        await queryRunner.query(`
            RENAME TABLE \`book_languages\` TO \`book_translations\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_translations\`
            ADD COLUMN \`title\` varchar(255) NULL AFTER \`languageId\`,
            ADD COLUMN \`description\` text NULL AFTER \`title\`,
            ADD COLUMN \`summary\` text NULL AFTER \`description\`
        `);
        await queryRunner.query(`
            UPDATE \`book_translations\` bt
            INNER JOIN \`books_backup\` b ON bt.bookId = b.id
            SET 
                bt.title = b.title,
                bt.description = b.description,
                bt.summary = b.summary
        `);
        await queryRunner.query(`
            ALTER TABLE \`books\`
            DROP COLUMN \`title\`,
            DROP COLUMN \`description\`,
            DROP COLUMN \`summary\`
        `);
        await queryRunner.query(`DROP TABLE \`books_backup\``);
        console.log('✅ Kitaplar başarıyla çoklu dil yapısına dönüştürüldü.');
        console.log('📝 Artık her dil için ayrı title, description ve summary girebilirsiniz.');
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`books\`
            ADD COLUMN \`title\` varchar(255) NULL,
            ADD COLUMN \`description\` text NULL,
            ADD COLUMN \`summary\` text NULL
        `);
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
        await queryRunner.query(`
            ALTER TABLE \`book_translations\`
            DROP COLUMN \`title\`,
            DROP COLUMN \`description\`,
            DROP COLUMN \`summary\`
        `);
        await queryRunner.query(`
            RENAME TABLE \`book_translations\` TO \`book_languages\`
        `);
        console.log('⚠️ Migration geri alındı. Çoklu dil verileri kaybolmuş olabilir!');
    }
}
exports.RefactorBooksWithTranslations1759600000000 = RefactorBooksWithTranslations1759600000000;
//# sourceMappingURL=1759600000000-RefactorBooksWithTranslations.js.map