"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSummaryToBooks1749000000007 = void 0;
class AddSummaryToBooks1749000000007 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE books ADD COLUMN summary TEXT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE books DROP COLUMN summary`);
    }
}
exports.AddSummaryToBooks1749000000007 = AddSummaryToBooks1749000000007;
//# sourceMappingURL=1749000000007-AddSummaryToBooks.js.map