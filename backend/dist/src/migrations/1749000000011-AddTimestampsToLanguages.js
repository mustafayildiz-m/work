"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTimestampsToLanguages1749000000011 = void 0;
class AddTimestampsToLanguages1749000000011 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE languages ADD COLUMN createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE languages ADD COLUMN updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE languages DROP COLUMN updatedAt`);
        await queryRunner.query(`ALTER TABLE languages DROP COLUMN createdAt`);
    }
}
exports.AddTimestampsToLanguages1749000000011 = AddTimestampsToLanguages1749000000011;
//# sourceMappingURL=1749000000011-AddTimestampsToLanguages.js.map