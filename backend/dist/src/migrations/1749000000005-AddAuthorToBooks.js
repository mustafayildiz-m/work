"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuthorToBooks1749000000005 = void 0;
class AddAuthorToBooks1749000000005 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE books ADD COLUMN author varchar(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE books DROP COLUMN author`);
    }
}
exports.AddAuthorToBooks1749000000005 = AddAuthorToBooks1749000000005;
//# sourceMappingURL=1749000000005-AddAuthorToBooks.js.map