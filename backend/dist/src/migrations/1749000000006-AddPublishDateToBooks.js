"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPublishDateToBooks1749000000006 = void 0;
class AddPublishDateToBooks1749000000006 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE books ADD COLUMN publishDate DATE NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE books DROP COLUMN publishDate`);
    }
}
exports.AddPublishDateToBooks1749000000006 = AddPublishDateToBooks1749000000006;
//# sourceMappingURL=1749000000006-AddPublishDateToBooks.js.map