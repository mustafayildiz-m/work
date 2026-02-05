"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLanguageIdToBookLanguages1747430645108 = void 0;
class AddLanguageIdToBookLanguages1747430645108 {
    constructor() {
        this.name = 'AddLanguageIdToBookLanguages1747430645108';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD \`language_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`book_languages\` ADD CONSTRAINT \`FK_book_languages_languages\` FOREIGN KEY (\`language_id\`) REFERENCES \`languages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP FOREIGN KEY \`FK_book_languages_languages\``);
        await queryRunner.query(`ALTER TABLE \`book_languages\` DROP COLUMN \`language_id\``);
    }
}
exports.AddLanguageIdToBookLanguages1747430645108 = AddLanguageIdToBookLanguages1747430645108;
//# sourceMappingURL=1747430645108-AddLanguageIdToBookLanguages.js.map