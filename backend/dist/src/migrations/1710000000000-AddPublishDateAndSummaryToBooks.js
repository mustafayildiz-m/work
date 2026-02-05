"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPublishDateAndSummaryToBooks1710000000000 = void 0;
class AddPublishDateAndSummaryToBooks1710000000000 {
    constructor() {
        this.name = 'AddPublishDateAndSummaryToBooks1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE books ADD COLUMN summary TEXT NULL`);
        await queryRunner.query(`ALTER TABLE books ADD COLUMN publishDate DATE NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE books DROP COLUMN publishDate`);
        await queryRunner.query(`ALTER TABLE books DROP COLUMN summary`);
    }
}
exports.AddPublishDateAndSummaryToBooks1710000000000 = AddPublishDateAndSummaryToBooks1710000000000;
//# sourceMappingURL=1710000000000-AddPublishDateAndSummaryToBooks.js.map