"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLocationFieldsToScholars1747436000000 = void 0;
class AddLocationFieldsToScholars1747436000000 {
    constructor() {
        this.name = 'AddLocationFieldsToScholars1747436000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE scholars
            ADD COLUMN latitude DECIMAL(10,8) NULL,
            ADD COLUMN longitude DECIMAL(11,8) NULL,
            ADD COLUMN locationName TEXT NULL,
            ADD COLUMN locationDescription TEXT NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE scholars
            DROP COLUMN latitude,
            DROP COLUMN longitude,
            DROP COLUMN locationName,
            DROP COLUMN locationDescription
        `);
    }
}
exports.AddLocationFieldsToScholars1747436000000 = AddLocationFieldsToScholars1747436000000;
//# sourceMappingURL=1747436000000-AddLocationFieldsToScholars.js.map