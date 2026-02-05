"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPdfUrlToScholarOwnBooks1749000000010 = void 0;
class AddPdfUrlToScholarOwnBooks1749000000010 {
    constructor() {
        this.name = 'AddPdfUrlToScholarOwnBooks1749000000010';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` ADD COLUMN \`pdfUrl\` varchar(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`scholar_own_books\` DROP COLUMN \`pdfUrl\``);
    }
}
exports.AddPdfUrlToScholarOwnBooks1749000000010 = AddPdfUrlToScholarOwnBooks1749000000010;
//# sourceMappingURL=1749000000010-AddPdfUrlToScholarOwnBooks.js.map