"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveTitleFromBooks1762190500000 = void 0;
class RemoveTitleFromBooks1762190500000 {
    constructor() {
        this.name = 'RemoveTitleFromBooks1762190500000';
    }
    async up(queryRunner) {
        const table = await queryRunner.getTable('books');
        if (table?.findColumnByName('title')) {
            console.log('📝 books tablosundan title kolonu kaldırılıyor...');
            await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`title\``);
        }
        if (table?.findColumnByName('description')) {
            console.log('📝 books tablosundan description kolonu kaldırılıyor...');
            await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`description\``);
        }
        if (table?.findColumnByName('summary')) {
            console.log('📝 books tablosundan summary kolonu kaldırılıyor...');
            await queryRunner.query(`ALTER TABLE \`books\` DROP COLUMN \`summary\``);
        }
        console.log('✅ books tablosu güncellendi. Artık title, description ve summary book_translations tablosunda saklanıyor.');
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`books\`
            ADD COLUMN \`title\` varchar(255) NULL,
            ADD COLUMN \`description\` text NULL,
            ADD COLUMN \`summary\` text NULL
        `);
        console.log('⚠️ Migration geri alındı. title, description, summary kolonları books tablosuna geri eklendi.');
    }
}
exports.RemoveTitleFromBooks1762190500000 = RemoveTitleFromBooks1762190500000;
//# sourceMappingURL=1762190500000-RemoveTitleFromBooks.js.map