"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsActiveToLanguages1749000000010 = void 0;
class AddIsActiveToLanguages1749000000010 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE languages ADD COLUMN isActive boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE languages DROP COLUMN isActive`);
    }
}
exports.AddIsActiveToLanguages1749000000010 = AddIsActiveToLanguages1749000000010;
//# sourceMappingURL=1749000000010-AddIsActiveToLanguages.js.map