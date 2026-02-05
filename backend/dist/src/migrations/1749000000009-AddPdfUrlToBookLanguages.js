"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPdfUrlToBookLanguages1749000000009 = void 0;
class AddPdfUrlToBookLanguages1749000000009 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE book_languages ADD COLUMN pdfUrl varchar(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE book_languages DROP COLUMN pdfUrl`);
    }
}
exports.AddPdfUrlToBookLanguages1749000000009 = AddPdfUrlToBookLanguages1749000000009;
//# sourceMappingURL=1749000000009-AddPdfUrlToBookLanguages.js.map