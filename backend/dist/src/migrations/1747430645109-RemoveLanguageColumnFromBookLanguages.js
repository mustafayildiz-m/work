"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveLanguageColumnFromBookLanguages1747430645109 = void 0;
class RemoveLanguageColumnFromBookLanguages1747430645109 {
    constructor() {
        this.name = 'RemoveLanguageColumnFromBookLanguages1747430645109';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP COLUMN \`language\``);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD \`language\` varchar(255) NOT NULL`);
    }
}
exports.RemoveLanguageColumnFromBookLanguages1747430645109 = RemoveLanguageColumnFromBookLanguages1747430645109;
//# sourceMappingURL=1747430645109-RemoveLanguageColumnFromBookLanguages.js.map