"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCoverImageToBooks1716902086000 = void 0;
class AddCoverImageToBooks1716902086000 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE books ADD COLUMN coverImage varchar(255) NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE books DROP COLUMN coverImage`);
    }
}
exports.AddCoverImageToBooks1716902086000 = AddCoverImageToBooks1716902086000;
//# sourceMappingURL=1716902086000-AddCoverImageToBooks.js.map