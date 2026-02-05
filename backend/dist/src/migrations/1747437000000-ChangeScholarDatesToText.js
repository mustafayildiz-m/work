"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeScholarDatesToText1747437000000 = void 0;
class ChangeScholarDatesToText1747437000000 {
    constructor() {
        this.name = 'ChangeScholarDatesToText1747437000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            UPDATE scholars 
            SET birthDate = DATE_FORMAT(birthDate, '%Y-%m-%d')
            WHERE birthDate IS NOT NULL
        `);
        await queryRunner.query(`
            UPDATE scholars 
            SET deathDate = DATE_FORMAT(deathDate, '%Y-%m-%d')
            WHERE deathDate IS NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE scholars
            MODIFY COLUMN birthDate TEXT NULL,
            MODIFY COLUMN deathDate TEXT NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE scholars
            MODIFY COLUMN birthDate DATE NULL,
            MODIFY COLUMN deathDate DATE NULL
        `);
    }
}
exports.ChangeScholarDatesToText1747437000000 = ChangeScholarDatesToText1747437000000;
//# sourceMappingURL=1747437000000-ChangeScholarDatesToText.js.map