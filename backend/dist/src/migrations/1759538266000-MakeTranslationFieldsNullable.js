"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeTranslationFieldsNullable1759538266000 = void 0;
class MakeTranslationFieldsNullable1759538266000 {
    constructor() {
        this.name = 'MakeTranslationFieldsNullable1759538266000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`scholar_post_translations\` 
            MODIFY COLUMN \`status\` enum('draft', 'pending', 'approved') NULL
        `);
        console.log('✅ Translation fields are now nullable for future moderation system.');
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`scholar_post_translations\` 
            MODIFY COLUMN \`status\` enum('draft', 'pending', 'approved') NOT NULL DEFAULT 'draft'
        `);
    }
}
exports.MakeTranslationFieldsNullable1759538266000 = MakeTranslationFieldsNullable1759538266000;
//# sourceMappingURL=1759538266000-MakeTranslationFieldsNullable.js.map