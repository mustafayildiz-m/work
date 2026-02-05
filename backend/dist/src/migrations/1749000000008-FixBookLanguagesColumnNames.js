"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixBookLanguagesColumnNames1749000000008 = void 0;
class FixBookLanguagesColumnNames1749000000008 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE book_languages CHANGE language_id languageId int NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE book_languages CHANGE languageId language_id int NULL`);
    }
}
exports.FixBookLanguagesColumnNames1749000000008 = FixBookLanguagesColumnNames1749000000008;
//# sourceMappingURL=1749000000008-FixBookLanguagesColumnNames.js.map